import ConfigParser
import datetime
import json
import random
import uuid
from random import randint
from elasticsearch import Elasticsearch


data = {
    "VRFId": "1946293155",
    "SrcNSG": "44.32.45.181",
    "DestNSG": "121.245.72.101",
    "SourceIP": "20.0.0.4",
    "SourcePort": 15125,
    "DestIP": "20.0.6.4",
    "DestinationPort": 53,
    "AppGroupId": "60fe3a70-4563-4292-bbbd-37a480e43ff7",
    "AppId": "34762b19-30c5-483a-ab69-e531abb4b3c8",
    "L7Classification": "DNS",
    "Proto": "UDP",
    "SrcUplinkIndex": 1,
    "srcUplinkRole": "primary",
    "DestUplinkIndex": 1,
    "dstUplinkRole": "primary",
    "SrcVportId": "6bf86674-b2aa-4477-a73c-2d18c7316197",
    "DestVportId": "",
    "Egress Bytes": 0,
    "Egress Pkts": 0,
    "Ingress Bytes": 7500,
    "Ingress Pkts": 125
}


class SimulateFlowData(object):
    def __init__(self, defData):
        self.nsg_id_prefix = defData["nsg_prefix"]
        self.nsg_count = defData["nsg_count"]
        self.app_count = defData["app_count"]
        self.app_group_count = defData["app_group_count"]
        # self.src_vport_count = defData["src_vport_count"]
        self.vport_count = defData["vport_count"]
        # self.dest_vport_count = defData["dest_vport_count"]
        self.domain_count = defData["domain_count"]
        self.src_ip_prefix = defData["src_ip_prefix"]
        self.dest_ip_prefix = defData["dest_ip_prefix"]
        self.npm_count = defData["npm_count"]
        self.perf_mon_count = defData["perf_mon_count"]

    def getRandomCidrPrefix(self):
        blockOne = random.randrange(1, 255, 1)
        blockTwo = random.randrange(1, 255, 1)
        blockThree = random.randrange(1, 255, 1)
        return str(blockOne) + "." + str(blockTwo) + "." + str(blockThree) + "."

    def getNSGIds(self):
        i = 0
        nsgids = []
        while i < self.nsg_count:
            nsg_subnet_cidr = self.getRandomCidrPrefix()
            nsg_last_octet = str(randint(2, 254))
            nsg_ip = nsg_subnet_cidr + nsg_last_octet
            nsg = {
                "nsg_subnet": nsg_subnet_cidr,
                "nsg_id": nsg_ip,
                "nsg_name": "ovs-" + nsg_last_octet
            }
            nsgids.append(nsg)
            i += 1
        return nsgids

    def getVsdNSGIds(self):
        i = 0
        # vsdnsgids = ["16.118.19.91", "27.18.60.32", "65.170.79.63",
        #           "27.106.226.140"]
        # vsdnsgids = ["167.247.97.198", "65.175.237.32", "92.180.82.217", "191.209.231.145"]
        vsdnsgids = ["104.41.101.14", "81.15.7.16", "213.201.93.120", "104.3.254.74"]

        nsgids = []
        while i < len(vsdnsgids):
            nsg_subnet_cidr = self.getRandomCidrPrefix()
            # nsg_last_octet = str(randint(2, 254))
            nsg_ip = vsdnsgids[i]
            nsg = {
                "nsg_subnet": nsg_subnet_cidr,
                "nsg_id": nsg_ip
            }
            nsgids.append(nsg)
            i += 1
        return nsgids

    def getL7class(self):
        l7class = ["HTTP", "SKYPE", "GOOGLE", "NETFLIX",
                   "CISCOVPN", "MSOffice365", "MSOUTLOOK", "SLIDESHARE",
                   "FACEBOOK", "WEBEX"]
        return l7class

    def getL4class(self):
        l4class = ["TCP", "UDP"]
        return l4class

    def getAppIds_old(self):
        i = 0
        appids = []
        while i < self.app_count:
            app_id = str(uuid.uuid4())
            appids.append(app_id)
            i += 1
        return appids

    def getAppIds(self):
        app_prefix = "myApp-"
        i = 0
        appids = []
        while i < self.app_count:
            app_id = str(uuid.uuid4())
            app = {
                "app_id": app_id,
                "app_name": app_prefix + str(i)
            }
            appids.append(app)
            i += 1
        return appids

    def getVsdAppIds(self):
        # appids = ["af007046-e083-4e2e-bded-40817a991e0d",
        #           "fa1cfa0a-a4d1-4b60-861d-9e485ef0d4e4",
        #           "0eafe1bc-eae7-4a99-8612-c614fbbb5e2a",
        #           "647eefad-d236-427f-83b4-64ae407ac323",
        #           "567c536d-b404-41df-997d-47b29c3b3f23"]
        # appids = ["c35febd3-ef4a-4898-824e-519b6608d981", "bd440249-d1be-4c84-b734-c90a92617af4"]
        appids = ["989dcb8a-c1a4-44f3-8444-2a8503f25f70", "86442ac9-a450-48cf-911e-1c2fa6821a6d", "c34d8ccf-ec77-461f-89ee-e5dbc79baa22", "c7e684b6-ae06-404f-b6e0-50ed64f0e49e"]
        return appids

    def getAppGroupIds(self, appids):
        i = 0
        appGrps = []
        appGrp_prefix = "myAG-"
        while i < self.app_group_count:
            app_group_id = str(uuid.uuid4())
            app_count = randint(1, self.app_count - 1)
            cnt = 0
            applist = []
            while cnt < app_count:
                app_index = random.randrange(0, len(appids) - 1, 1)
                applist.append(appids[app_index])
                cnt += 1

            app_grp = {
                "appgrp_id": app_group_id,
                "app_list": applist,
                "appgrp_name": appGrp_prefix + str(i)
            }
            appGrps.append(app_grp)
            i += 1
        return appGrps

    def getNPMGrps(self, perfmons):
        i = 0
        npmGrps = []
        npmGrp_prefix = "myNPM-"
        while i < self.npm_count:
            npm_group_id = str(uuid.uuid4())
            npm_grp = {
                "npmgrp_id": npm_group_id,
                "npmgrp_name": npmGrp_prefix + str(i),
                "perf_monitor": random.choice(perfmons)
            }
            npmGrps.append(npm_grp)
            i += 1
        return npmGrps

    def getPerfMons(self):
        servClasses = ["A", "B", "C", "D", "E", "F", "G", "H"]
        probe_intervals = [1.0, 10.0]
        probe_pkts = [1.0, 10.0]
        i = 0
        perfmons = []
        perfmon_prefix = "PerfMonitor-"
        while i < self.perf_mon_count:
            perfmon_id = str(uuid.uuid4())
            perfmon_name = perfmon_prefix + str(i)
            perfmon = {
                "perfmon_id": perfmon_id,
                "perfmon_name": perfmon_name,
                "service_class": random.choice(servClasses),
                "monitor_payload": randint(16, 2048),
                "probe_interval": random.choice(probe_intervals),
                "probe_num_pkts": random.choice(probe_pkts)
            }
            perfmons.append(perfmon)
            i += 1
        return perfmons

    def getVsdAppGroupIds(self, appids):
        i = 0
        # vsdAppGrps = ["8561a341-6609-46b9-84a4-2fa7173d34b4",
        #            "373c8a21-f220-4cdd-a329-42f90e3a35b1",
        #            "e4bd6733-83b4-4c6f-afe6-fbc212730d24",
        #            "f2234323-a15a-40b7-a814-3a808c5675d2",
        #            "420ab6ba-da1b-43ad-8f97-d4f9ddc91cea"]
        # vsdAppGrps = ["c275c32a-a434-4e91-bcde - 13ae28d72408", "d7a6665b-740b-4c9a-a2e3-da289bc9eb3b"]
        vsdAppGrps = ["2ebd9d05-8ba4-47c4-8b7e-38fb2bc9e668", "0d611654-775e-4fef-b30c - 16e90913b4b6", "d10aa985-c4ef-44b6-a085-f5e7b6b68bd7"]
        appGrps = []
        i = 0
        while i < len(vsdAppGrps):
            app_group_id = vsdAppGrps[i]
            app_count = randint(1, 3)
            cnt = 0
            applist = []
            while cnt < app_count:
                app_index = random.randrange(0, len(appids) - 1, 1)
                applist.append(appids[app_index])
                cnt += 1

            app_grp = {
                "appgrp_id": app_group_id,
                "app_list": applist
            }
            appGrps.append(app_grp)
            i += 1
        return appGrps

    def getProto(self):
        proto = ["TCP", "UDP"]
        return proto

    def getVports(self, nsgs, domain):
        vport_prefix = "vport-"
        nsg_vport_hash = {}
        for index, nsg in enumerate(nsgs):
            vportlist = []
            i = 0
            while i < self.vport_count:
                last_octet = str(randint(2, 254))
                vport = {
                    "vport_id": str(uuid.uuid4()),
                    "vport_name": vport_prefix + last_octet,
                    "vport_ip": nsg["nsg_subnet"] + last_octet,
                    "port": randint(0, 4094),
                    "nsg_id": nsg["nsg_id"],
                    "nsg_name": nsg["nsg_name"],
                    "domain": domain
                }
                vportlist.append(vport)
                i += 1

            nsg_vport_hash[nsg["nsg_id"]] = vportlist

        return nsg_vport_hash

    def getDestVports(self):
        i = 0
        destVports = []
        while i < self.dest_vport_count:
            dest_vport = str(uuid.uuid4())
            dest_ip_last = str(randint(2, 254))
            dest_ip = self.dest_ip_prefix + dest_ip_last
            dest_port = randint(0, 4094)
            vportData = {
                "vportId": dest_vport,
                "dest_ip": dest_ip,
                "dest_port": dest_port
            }
            destVports.append(vportData)
            i += 1
        return destVports

    def getDomainIds(self):
        # domainIds = ["20001", "20011"]
        # domainIds = ["769960975"]
        domainIds = ["31683034", "1457206697"]

        # while i <= self.domain_count:
        #     domId = domPrefix + str(i)
        #     domainIds.append(domName)
        #     i += 1
        return domainIds

    def getDomainNames(self):
        i = 1
        domainNames = []
        domPrefix = "Domain"
        while i <= self.domain_count:
            domName = domPrefix + str(i)
            domainNames.append(domName)
            i += 1
        return domainNames

    def getDomData(self, domName, nsgs):
        vports = self.getVports(nsgs, domain=domName)
        domData = {
            "domName": domName,
            "vport_hash": vports
        }
        return domData

    def getSrcUplink(self):
        # srcUplink = ["primary1", "primary2", "secondary1", "secondary2"]
        srcUplink = ["primary1", "secondary2"]
        return srcUplink

    def getDestuplink(self):
        # destUplink = ["primary1", "primary2", "secondary1", "secondary2"]
        destUplink = ["primary1", "secondary2"]
        return destUplink


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime.datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError("Type not serializable")


def datetime_to_epoch(curtime):
    referenceTimestamp = datetime.datetime(1970, 1, 1, 0, 0, 0)
    tseconds = (curtime - referenceTimestamp).total_seconds()
    return tseconds * 1000

l7_to_in_bytes = {
    "MSOUTLOOK": 2089,
    "WEBEX": 3456,
    "FACEBOOK": 300,
    "SLIDESHARE": 500
}
l7_to_in_pkts = {
    "NETFLIX": 8,
    "WEBEX": 9,
    "FACEBOOK": 1,
    "CISCOVPN": 1
}


def create_pre_defined_flows(**kwargs):
    appgrpids = kwargs["appgrpids"]
    protos = kwargs["protos"]
    l7s = kwargs["l7s"]
    domains = kwargs["domains"]
    nsgs = kwargs["nsgs"]
    simData = kwargs["simData"]
    flows = []
    for dom in domains:
        domData = simData.getDomData(dom, nsgs)
        vporthash = domData.get("vport_hash")
        for nsg_ind, nsgData in enumerate(nsgs):
            src_nsgid = nsgData["nsg_id"]
            svports = vporthash.get(src_nsgid)
            # dnsg = random.randrange(0, len(nsgs) - 1, 1)
            # dest_nsgData = nsgs[dnsg]
            # dest_nsgid = dest_nsgData["nsg_id"]
            # dvports = vporthash.get(dest_nsgid)

            for index, svport in enumerate(svports):
                dindex = index + 1
                while dindex < len(svports):
                    dvport = svports[dindex]
                    app_cnt = 0
                    while app_cnt < 5:
                        app_index = random.randrange(0, len(appgrpids) - 1, 1)
                        appgrp = appgrpids[app_index]
                        app_grpid = appgrp["appgrp_id"]
                        app_grpname = appgrp["appgrp_name"]
                        applist = appgrp["app_list"]
                        app_rand = randint(0, len(applist) - 1)
                        app = applist[app_rand]
                        proto = randint(0, len(protos) - 1)
                        l7 = randint(0, len(l7s) - 1)

                        flow_entry = {
                            "app_grp": app_grpid,
                            "app_grp_name": app_grpname,
                            "app_id": app["app_id"],
                            "app_name": app["app_name"],
                            "Proto": protos[proto],
                            "l7_class": l7,
                            "src_vport": svport,
                            "dest_vport": dvport
                        }
                        # flows[(svport["vport_id"], dvport["vport_id"])] = flow_entry
                        flows.append(flow_entry)
                        app_cnt += 1
                    dindex += 1

    return flows


class SimulateProbeStats(object):
    def __init__(self, flowData):
        self.nsgs = flowData["nsgs"]
        self.appgrps = flowData["app_grps"]
        self.srcUplinks = flowData["srcuplinks"]
        self.destUplinks = flowData["destuplinks"]
        self.domains = flowData["domains"]
        self.def_ent_name = flowData["def_ent_name"]
        self.es = flowData["es"]
        self.es_index_prefix = flowData["es_index_prefix"]
        self.npm_grps = flowData["npm_grps"]
        self.contro_states = ["Null", "Connecting", "Up", "Down", "Started"]

    def generate_probe_stats(self, startTime, endTime):
        nsgs = self.nsgs
        # app_grps = self.appgrps
        srcuplinks = self.srcUplinks
        destuplinks = self.destUplinks
        domains = self.domains
        npm_grps = self.npm_grps
        probe_cnt = 0
        firstTS = True
        control_down_prob = 0.005
        # es = self.es
        # es_index_prefix = self.es_index_prefix
        with open('/var/log/probestats_new.log', 'w') as probestats:
            timestamp = startTime
            t_increment = 0
            # t_increment = 30
            while timestamp != endTime:
                # timestamp = startTime + datetime.timedelta(0, t_increment)
                timestamp = startTime + t_increment * 1000
                probe_record = {}
                for s_nsg_ind, src_nsg in enumerate(nsgs):
                    initPacket = 1
                    d_nsg_ind = s_nsg_ind + 1
                    while d_nsg_ind < len(nsgs):
                        # d_nsg_ind = s_nsg_ind
                        # while d_nsg_ind == s_nsg_ind:
                        #     d_nsg_ind = random.randrange(0, len(nsgs) - 1)
                        dest_nsg = nsgs[d_nsg_ind]
                        srcUp = randint(0, 1)
                        destUp = randint(0, 1)
                        domain = randint(0, len(domains) - 1)
                        # app_grp_index = random.randrange(
                        #     0, len(app_grps) - 1, 1)
                        # app_grp = app_grps[app_grp_index]
                        npm_grp = random.choice(npm_grps)
                        perf_mon = npm_grp["perf_monitor"]
                        avg_latency = random.uniform(0.01, 1000)
                        avg_jitter = random.uniform(0.01, 100)
                        avg_pktloss = random.uniform(0.00, 100)
                        probe_record["timestamp"] = long(timestamp)
                        probe_record["SrcNSG"] = src_nsg["nsg_id"]
                        probe_record["SourceNSG"] = src_nsg["nsg_name"]
                        probe_record["DstNSG"] = dest_nsg["nsg_id"]
                        probe_record["DestinationNSG"] = dest_nsg["nsg_name"]
                        probe_record["SrcUplink"] = srcuplinks[srcUp]
                        probe_record["DstUplink"] = destuplinks[destUp]
                        probe_record["NPMGroup"] = npm_grp["npmgrp_name"]
                        probe_record["PerfMonitor"] = perf_mon["perfmon_name"]
                        probe_record["MonitorServiceClass"] = perf_mon["service_class"]
                        probe_record["MonitorPayload"] = perf_mon["monitor_payload"]
                        probe_record["MonitorProbeInterval"] = perf_mon["probe_interval"]
                        probe_record["MonitorProbeNoOfPackets"] = perf_mon["probe_num_pkts"]
                        probe_record["AvgDelay"] = avg_latency
                        probe_record["AvgJitter"] = avg_jitter
                        probe_record["AvgPktLoss"] = avg_pktloss
                        probe_record["Domain"] = domains[domain]
                        probe_record["EnterpriseName"] = self.def_ent_name
                        probe_record["ControlSessionState"] = self.contro_states[0]
                        if firstTS and initPacket == 1:
                            probe_record["ControlSessionState"] = self.contro_states[2]
                            probe_record["AvgDelay"] = "Null"
                            probe_record["AvgJitter"] = "Null"
                            probe_record["AvgPktLoss"] = "Null"
                            initPacket = 0
                        else:
                            if get_random_with_prob(control_down_prob):
                                probe_record["ControlSessionState"] = self.contro_states[3]
                                probe_record["AvgDelay"] = "Null"
                                probe_record["AvgJitter"] = "Null"
                                probe_record["AvgPktLoss"] = "Null"

                        json.dump(probe_record, probestats,
                                  default=json_serial)
                        probestats.write("\n")
                        index_name = "nuage_dpi_probestats" + '_' + self.es_index_prefix
                        self.es.index(index=index_name, doc_type='nuage_doc_type', body=probe_record)
                        probe_cnt += 1
                        d_nsg_ind += 1
                t_increment += 30
                firstTS = False

        print "probe_cnt = " + str(probe_cnt)


def get_random_with_prob(probability):
    if random.random() <= probability:
        return 1
    else:
        return 0


class SimulateSLAStats(object):
    def __init__(self, flowData):
        self.nsgs = flowData["nsgs"]
        self.appgrps = flowData["app_grps"]
        self.srcUplinks = flowData["srcuplinks"]
        self.destUplinks = flowData["destuplinks"]
        self.domains = flowData["domains"]
        self.slastatus = [1, 0]
        self.slatype = ["latency", "jitter", "packetloss", "latency, jitter",
                        "latency, packetloss", "jitter, packetloss", "latency, jitter, packetloss"]
        self.l4class = ["TCP", "UDP"]
        self.sla_prob = 0.8
        self.def_ent_name = flowData["def_ent_name"]
        self.es = flowData["es"]
        self.es_index_prefix = flowData["es_index_prefix"]

    def generate_sla_stats(self, startTime, endTime):
        nsgs = self.nsgs
        app_grps = self.appgrps
        srcuplinks = self.srcUplinks
        destuplinks = self.destUplinks
        domains = self.domains
        l4class = self.l4class
        sla_cnt = 0

        with open('/var/log/slastats_new.log', 'w') as slastats:
            timestamp = startTime
            t_increment = 0
            # t_increment = 30
            while timestamp != endTime:
                # timestamp = startTime + datetime.timedelta(0, t_increment)
                timestamp = startTime + t_increment * 1000
                probe_record = {}
                for s_nsg_ind, src_nsg in enumerate(nsgs):
                    if s_nsg_ind % 2:
                        d_nsg_ind = s_nsg_ind
                        while d_nsg_ind == s_nsg_ind:
                            d_nsg_ind = random.randrange(0, len(nsgs) - 1)
                        for appgrp in app_grps:
                            applist = app_grps["app_list"]
                            app = random.choice(applist)
                            l4_class = get_random_with_prob(self.sla_prob)
                            # if ( get_random_with_prob(self.sla_prob) ):
                            #     slastatus = 0
                            # else:
                            #     slastatus = 1
                            sla_type = random.randint(0, len(self.slatype) - 1)
                            violation = self.slatype[sla_type]
                            dest_nsg = nsgs[d_nsg_ind]
                            srcUp = randint(0, 1)
                            destUp = randint(0, 1)
                            domain = randint(0, len(domains) - 1)
                            probe_record["timestamp"] = long(timestamp)
                            probe_record["SrcNSG"] = src_nsg["nsg_id"]
                            probe_record["SourceNSG"] = src_nsg["nsg_name"]
                            probe_record["DstNSG"] = dest_nsg["nsg_id"]
                            probe_record["DestinationNSG"] = dest_nsg["nsg_name"]
                            probe_record["SrcUplink"] = srcuplinks[srcUp]
                            probe_record["DstUplink"] = destuplinks[destUp]
                            probe_record["AppGroupID"] = appgrp["appgrp_id"]
                            probe_record["APMGroup"] = appgrp["appgrp_name"]
                            probe_record["Application"] = app["app_name"]
                            # probe_record["slaStatus"] = slastatus
                            probe_record["L4Classification"] = l4class[l4_class]
                            probe_record["ViolationType"] = violation
                            probe_record["Domain"] = domains[domain]
                            probe_record["EnterpriseName"] = self.def_ent_name
                            json.dump(probe_record, slastats,
                                      default=json_serial)
                            slastats.write("\n")
                            index_name = "nuage_dpi_slastats" + '_' + self.es_index_prefix
                            self.es.index(index=index_name, doc_type='nuage_doc_type', body=probe_record)
                            sla_cnt += 1
                t_increment += 30

        print "sla_cnt = " + str(sla_cnt)


def main():
    #  Load the configuration file
    config = ConfigParser.ConfigParser()
    config.read("config.ini")
    defData = {}
    defData["nsg_count"] = config.getint('default', 'nsg_count')
    defData["nsg_prefix"] = config.get('default', 'nsg_prefix')
    defData["app_count"] = config.getint('default', 'app_count')
    defData["app_group_count"] = config.getint('default', 'app_group_count')
    defData["vport_count"] = config.getint('default', 'vport_count')
    defData["src_ip_prefix"] = config.get('default', 'src_ip_prefix')
    defData["dest_ip_prefix"] = config.get('default', 'dest_ip_prefix')
    defData["domain_count"] = config.getint('default', 'domain_count')
    defData["npm_count"] = config.getint('default', 'npm_count')
    defData["perf_mon_count"] = config.getint('default', 'perf_mon_count')

    def_ent_name = config.get('default', 'def_ent_name')
    es_server = config.get('default', 'es_server')

    start_time = config.get('default', 'start_time')
    start_ts = start_time.split('/')
    es_index_prefix = start_ts[0] + '_' + start_ts[1] + '_' + start_ts[2]
    start_ts = map(int, start_ts)
    startTime = datetime.datetime(start_ts[0], start_ts[1], start_ts[2], start_ts[3], start_ts[4], start_ts[5])
    startTime = datetime_to_epoch(startTime)

    end_time = config.get('default', 'end_time')
    end_ts = end_time.split('/')
    end_ts = map(int, end_ts)
    endTime = datetime.datetime(end_ts[0], end_ts[1], end_ts[2], end_ts[3], end_ts[4], end_ts[5])
    endTime = datetime_to_epoch(endTime)

    print startTime
    print endTime

    simData = SimulateFlowData(defData)

    domains = simData.getDomainNames()
    protos = simData.getProto()
    srcuplinks = simData.getSrcUplink()
    destuplinks = simData.getDestuplink()
    l7s = simData.getL7class()
    appids = simData.getAppIds()
    appgrpids = simData.getAppGroupIds(appids)
    nsgs = simData.getNSGIds()
    perf_mons = simData.getPerfMons()
    npm_grps = simData.getNPMGrps(perf_mons)
    slastatus = ["InSla", "OutSla", "Unmonitored"]
    sla_prob = 0.05
    hasswitchedpath = ["false", "true"]

    pre_flows = create_pre_defined_flows(appgrpids=appgrpids, l7s=l7s,
                                         protos=protos,
                                         domains=domains, nsgs=nsgs,
                                         simData=simData)
    es = Elasticsearch(es_server)
    flow_cnt = 0
    with open('/var/log/flowstats_new.log', 'w') as flowstats:
        timestamp = startTime
        t_increment = 0
        while timestamp != endTime:
            # deltaTime = datetime.timedelta(0, t_increment)
            # timestamp = startTime + datetime.timedelta(0, t_increment)
            timestamp = startTime + t_increment * 1000
            # print timestamp
            flow_record = {}
            i = 0
            for flow_entry in pre_flows:
                # flow_entry = pre_flows[flow]
                # svport =  randint(0, 9)
                # dvport = randint(0, 9)
                s_vport = flow_entry["src_vport"]
                d_vport = flow_entry["dest_vport"]
                dom = s_vport["domain"]
                # import pdb pdb.set_trace()
                src_nsgid = s_vport["nsg_id"]
                # dest_nsgid = d_vport["nsg_id"]
                src_nsgname = s_vport["nsg_name"]
                # dest_nsgname = d_vport["nsg_name"]
                src_vportId = s_vport["vport_id"]
                src_vportName = s_vport["vport_name"]
                src_ip = s_vport["vport_ip"]
                src_port = s_vport["port"]
                # dest_vportId = d_vport["vport_id"]
                # dest_vportName = d_vport["vport_name"]
                dest_ip = d_vport["vport_ip"]
                dest_port = d_vport["port"]
                proto = flow_entry["Proto"]
                srcUp = randint(0, 1)
                destUp = randint(0, 1)
                sla_status = get_random_with_prob(sla_prob)
                l7 = flow_entry["l7_class"]
                appid = flow_entry["app_id"]
                appname = flow_entry["app_name"]
                appgrpid = flow_entry["app_grp"]
                appgrpname = flow_entry["app_grp_name"]
                # appgrpid = flow_entry["app_grp"]
                if l7s[l7] in l7_to_in_bytes.keys():
                    inbytes = l7_to_in_bytes.get(l7s[l7])
                else:
                    inbytes = randint(100, 4048)
                if l7s[l7] in l7_to_in_pkts.keys():
                    inpkts = l7_to_in_pkts.get(l7s[l7])
                else:
                    inpkts = randint(0, 10)
                ingressMB = float(inbytes) / 1048576

                # flow record tuples
                i += 1
                flow_record["timestamp"] = long(timestamp)
                flow_record["Domain"] = dom
                flow_record["EnterpriseName"] = def_ent_name
                flow_record["SrcVportUUID"] = src_vportId
                flow_record["SrcVportName"] = src_vportName
                # flow_record["DstVportUUID"] = dest_vportId
                flow_record["SrcIp"] = src_ip
                flow_record["SrcPort"] = src_port
                flow_record["DstIp"] = dest_ip
                flow_record["DstPort"] = dest_port
                flow_record["Proto"] = proto
                flow_record["SrcNSG"] = src_nsgid
                flow_record["SourceNSG"] = src_nsgname
                flow_record["SrcUplink"] = srcuplinks[srcUp]
                flow_record["DstUplink"] = destuplinks[destUp]
                flow_record["L7Classification"] = l7s[l7]
                flow_record["AppID"] = appid
                flow_record["Application"] = appname
                flow_record["AppGroupID"] = appgrpid
                flow_record["APMGroup"] = appgrpname
                flow_record["IngressBytes"] = inbytes
                flow_record["IngressMB"] = ingressMB
                flow_record["IngressPackets"] = inpkts
                flow_record["EgressBytes"] = inbytes
                flow_record["EgressMB"] = float(inbytes) / 1048576  # TODO: What is this number ?
                flow_record["TotalBytesCount"] = inbytes + inbytes
                flow_record["TotalMB"] = float(flow_record["TotalBytesCount"]) / 1048576
                flow_record["EgressPackets"] = inpkts
                flow_record["TotalPacketsCount"] = inpkts + inpkts
                flow_record["DstNSG"] = src_nsgid
                flow_record["DestinationNSG"] = src_nsgname
                flow_record["SlaStatus"] = slastatus[sla_status]
                flow_record["HasSwitchedPaths"] = hasswitchedpath[sla_status]

                json.dump(flow_record, flowstats, default=json_serial)
                flowstats.write("\n")
                index_name = "nuage_dpi_flowstats" + '_' + es_index_prefix
                es.index(index=index_name, doc_type='nuage_doc_type', body=flow_record)
                flow_cnt += 1
            t_increment += 30

    print flow_cnt
    flowData = {
        "nsgs": nsgs,
        "app_grps": appgrpids,
        "srcuplinks": srcuplinks,
        "destuplinks": destuplinks,
        "domains": domains,
        "def_ent_name": def_ent_name,
        "es": es,
        "es_index_prefix": es_index_prefix,
        "npm_grps": npm_grps
    }
    probe_stats = SimulateProbeStats(flowData)
    probe_stats.generate_probe_stats(startTime, endTime)

    sla_stats = SimulateSLAStats(flowData)
    sla_stats.generate_sla_stats(startTime, endTime)

if __name__ == '__main__':
    main()
