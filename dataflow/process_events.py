import argparse
import json
import logging
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions
from google.cloud import firestore

# --- Custom Transform ---

class DetectSurge(beam.DoFn):
    """
    Business logic to identify stadium surges.
    If gate scans per window exceed a threshold, we update the global aura status.
    """
    def __init__(self, project_id):
        self.project_id = project_id

    def process(self, element, window=beam.DoFn.WindowParam):
        # Element is the count of events in this window
        count = element
        threshold = 50 # Example: 50 scans/min is a surge
        
        db = firestore.Client(project=self.project_id)
        venue_ref = db.collection('venues').document('wankhede')
        
        if count > threshold:
            logging.info(f"SURGE DETECTED: {count} scans in window. Triggering reroute.")
            venue_ref.update({
                'activeMatch.momentum': 'high',
                'activeMatch.status_note': 'High Ingress Volume - Rerouting suggested'
            })
        else:
            logging.info(f"Normal load: {count} scans.")
            venue_ref.update({
                'activeMatch.status_note': 'Steady Flow'
            })
        
        yield count

# --- Pipeline Definition ---

def run(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_topic', required=True, help='Pub/Sub topic to read from')
    parser.add_argument('--project_id', required=True, help='GCP Project ID')
    known_args, pipeline_args = parser.parse_known_args(argv)

    options = PipelineOptions(pipeline_args, streaming=True)
    
    with beam.Pipeline(options=options) as p:
        (
            p 
            | "Read from PubSub" >> beam.io.ReadFromPubSub(topic=known_args.input_topic)
            | "Parse JSON" >> beam.Map(lambda x: json.loads(x.decode('utf-8')))
            | "Filter Gate Scans" >> beam.Filter(lambda x: x['type'] == 'GATE_SCAN')
            | "Add Timestamp" >> beam.Map(lambda x: beam.window.TimestampedValue(x, x['timestamp'] / 1000))
            | "Fixed Window (1min)" >> beam.WindowInto(beam.window.FixedWindows(60))
            | "Count per Window" >> beam.CombineGlobally(beam.combiners.CountCombineFn()).without_defaults()
            | "Detect Surge & Update DB" >> beam.ParDo(DetectSurge(known_args.project_id))
        )

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.INFO)
    run()
