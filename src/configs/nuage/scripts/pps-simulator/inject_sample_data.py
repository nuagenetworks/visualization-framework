#Reads from sample_data.json and injects the same data to a sample_index in localhost elasticsearch database. To use, paste the sample data in the file.

from elasticsearch import Elasticsearch
es = Elasticsearch('http://localhost:9200')
import json

try:
    data = json.load(open('sample_data.json','r'))
except:
    print('Error reading sample_data.json. Exiting.')
    exit(0)

try:
    hits = data['hits']['hits']
except:
    print('Hits not present in data. Check data. Exiting.')
    exit(0)

print('Number of hits read = %d'%(len(hits)))
print("Indexing...")

for hit in hits:
    hit = hit['_source']
    es.index(index='sample_index_1',doc_type='nuage_doc_type',body=hit)

print('Finished..')