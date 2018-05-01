from flask import Flask, jsonify
import ConfigParser
import os
import random
import json

app = Flask(__name__)
mock_location_file = 'mock_locations.json'

#--------------------Flask APp starts here-------------------------------

@app.route("/nuage/api/v5_0/enterprises/<enterpriseId>/gatewayslocations", methods=['GET','POST'])
def serve_location_data(enterpriseId):
    with open(mock_location_file,'r') as location_file:
        d = json.load(location_file)
    return jsonify(d)

#--------------------Flask App ends here--------------------------------


#All simulated data starts here
def get_nuage_locations():
    locs = []
    locs.append(["755 Ravendale Dr, Mountain View, CA 94043, USA",
            37.39,
            -122.051,
            "Mountain View",
            "California",
            "United States"
            ])
    locs.append(["2301 Sugar Bush Rd #300, Raleigh, NC 27612, USA",
                 35.8446,
                 -78.6749,
                 "Raleigh",
                 "North Carolina",
                 "United States"
                ])
    return locs

def get_random_locations(num_output):
    #Algo - Get a random number between 1 and num_locations. This will be max locations to be added. rest would be clustered
    num_locations = random.randint(1,num_output)
    locs = [("Place-{0}".format(i),
             random.uniform(-90,90),
             random.uniform(-180,180),
             "City-{0}".format(i),
             "State-{0}".format(i),
             "Country-{0}".format(i)
             )
            for i in range(num_locations)]
    print("{0} locations created.".format(num_locations))
    output = [random.choice(locs) for _ in range(num_output)]
    return output

def write_location_data(num_nsgs):
    data = [] # To hold all the json snippets
    addresses = [] #To hold all the address tuples
    addresses.extend(get_nuage_locations())
    addresses.extend(get_random_locations(num_nsgs))
    for i in range(num_nsgs):
        loc = {}
        loc['children'] = None
        loc['parentType'] = "nsgateway"
        loc['entityScope'] = "ENTERPRISE"
        loc['lastUpdatedBy'] = ""
        loc['lastUpdatedDate'] = None
        loc['creationDate'] = None
        loc['address'] = addresses[i][0]
        loc['latitude'] = addresses[i][1]
        loc['longitude'] = addresses[i][2]
        loc['locality'] = addresses[i][3]
        loc['state'] = addresses[i][4]
        loc['country'] = addresses[i][5]
        loc['timeZoneID'] = "UTC"
        loc['ignoreGeocode'] = False
        loc['owner'] = ""
        loc['ID'] = ""
        loc['parentID'] = ""
        loc['externalID'] = None
        loc['associatedEntityID'] = ""
        loc['associatedEntityName'] = "ovs-{0}".format(i+1) #OVS names don't start with 0
        loc['associatedEntityType'] = "NSGATEWAY"
        data.append(loc)
        del loc
    with open(mock_location_file,'w') as location_file:
        try:
            json.dump(data,location_file)
        except Exception as e:
            print(e)
            print("File couldn't be written. Aborting.\n")
            exit(0)
        else:
            print("File written successfully.\n")
    return

if __name__ == '__main__':
    config = ConfigParser.ConfigParser()
    config.read("config.ini")
    enterpriseID = config.get('default','enterprise_id')
    print("Enterprise ID: {0}".format(enterpriseID))
    if not os.path.isfile(mock_location_file):
        print("Mock locations file doesn't exist. Creating one.")
        num_nsgs = config.getint('default','nsg_count')
        write_location_data(num_nsgs)
    app.run(debug=False)