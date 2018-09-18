import ConfigParser
import datetime
import json
import random
import uuid
from random import randint
from elasticsearch import Elasticsearch, helpers
import time

class SimulateAARData(object):
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
        self.natt_ip_prefix = defData["natt_ip_prefix"]
        self.natt_port = defData["natt_port"]
        self.npm_count = defData["npm_count"]
        self.perf_mon_count = defData["perf_mon_count"]
        self.duc_count = defData["duc_count"]
        self.out_sla_app_count = defData['out_sla_app_count']

    def getRandomCidrPrefix(self):
        blockOne = random.randrange(1, 255, 1)
        blockTwo = random.randrange(1, 255, 1)
        blockThree = random.randrange(1, 255, 1)
        return str(blockOne) + "." + str(blockTwo) + "." + str(blockThree) + "."

    def getNSGIds(self):
        i = 0
        nsgids = []
        while i < self.nsg_count:
            #nsg_subnet_cidr = self.getRandomCidrPrefix()
            nsg_subnet_cidr = self.nsg_id_prefix
            nsg_natt_cidr = self.natt_ip_prefix
            nsg_natt_port = self.natt_port
            #nsg_last_octet = str(randint(2, 254))
            nsg_last_octet = str(i)
            nsg_ip = nsg_subnet_cidr + nsg_last_octet
            nsg = {
                "nsg_subnet": nsg_subnet_cidr,
                "nsg_id": nsg_ip,
                "nsg_name": "ovs-" + nsg_last_octet,
                "nsg_natt_ip":nsg_natt_cidr + nsg_last_octet,
                "nsg_natt_port":nsg_natt_port
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
        app_id = str(uuid.uuid4())
        app = {
            "app_id": app_id,
            "app_name": "Default Application"
        }
        appids.append(app.copy())
        while i < self.app_count:
            app_id = str(uuid.uuid4())
            app = {
                "app_id": app_id,
                "app_name": app_prefix + str(i)
            }
            appids.append(app.copy())
            i += 1


        return appids

    def getOutSlaApps(self):
        apps = random.sample(range(0,self.app_count),self.out_sla_app_count)
        outslas = ['myApp-%d'%(app) for app in apps]
        return outslas

    # To simplify each appgroup will contain one application
    def getAppGroupIds(self, appids):
        i = 0
        appGrps = []
        appGrp_prefix = "myAG-"
        while i < self.app_group_count:
            app_group_id = str(uuid.uuid4())
            #app_count = randint(1, self.app_count - 1)
            cnt = 0
            applist = []
            applist.append(appids[i])
            if i==self.app_group_count-1:
                applist.extend(appids[i+1:])
            #while cnt < app_count:
            #   app_index = random.randrange(0, len(appids) - 1, 1)
            #   applist.append(appids[app_index])
            #   cnt += 1

            app_grp = {
                "appgrp_id": app_group_id,
                "app_list": applist,
                "appgrp_name": appGrp_prefix + str(i)
            }
            appGrps.append(app_grp.copy())
            i += 1
        return appGrps

    def getDucGrpIds(self):
        duc_prefix = "duc-"
        i = 0
        ducgrpids = []
        while i < self.duc_count:
            duc_id = str(uuid.uuid4())
            duc = {
                "duc_id": duc_id,
                "duc_name": duc_prefix + str(i)
            }
            ducgrpids.append(duc.copy())
            i += 1
        return ducgrpids

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
            npmGrps.append(npm_grp.copy())
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
            perfmons.append(perfmon.copy())
            i += 1
        return perfmons

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
                #last_octet = str(randint(2, 254))
                last_octet = str(i)
                vport = {
                    "vport_id": str(uuid.uuid4()),
                    "vport_name": vport_prefix + last_octet,
                    "vport_ip": nsg["nsg_subnet"] + last_octet,
                    #"port": randint(0, 4094),
                    "port": i,
                    "nsg_id": nsg["nsg_id"],
                    "nsg_name": nsg["nsg_name"],
                    "domain": domain
                }
                vportlist.append(vport.copy())
                i += 1

            nsg_vport_hash[nsg["nsg_id"]] = vportlist

        return nsg_vport_hash

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




class SimulateFlowStats(object):
    def __init__(self, flowData, simData):
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
        self.duc_grps = flowData["duc_grps"]
        self.slastatus = ["InSla", "OutSla", "Unmonitored"]
        #self.outslaApps = 0.05
        self.outslaApps = flowData['outslaApps']
        self.protos = flowData["protos"]
        self.l7s = flowData["l7s"]
        self.perf_mons = flowData["perf_mons"]
        self.simData = simData
        self.hasswitchedpath = ["false", "true"]

    def create_pre_defined_flows(self, **kwargs):
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
                        app_grp_cnt = 0
                        while app_grp_cnt < len(appgrpids):
                            #app_index = random.randrange(0, len(appgrpids) - 1, 1)
                            #app_grp_index = app_grp_cnt
                            appgrp = appgrpids[app_grp_cnt]
                            app_grpid = appgrp["appgrp_id"]
                            app_grpname = appgrp["appgrp_name"]
                            applist = appgrp["app_list"]
                            app_rand = randint(0, len(applist) - 1)
                            app = applist[app_rand]
                            #app = applist[0]
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
                            flows.append(flow_entry.copy())
                            app_grp_cnt += 1
                        dindex += 1

        return flows


    def generate_flow_stats(self, startTime, endTime,es_chunk_size):
        pre_flows = self.create_pre_defined_flows(appgrpids=self.appgrps, l7s=self.l7s,
                                         protos=self.protos,
                                         domains=self.domains, nsgs=self.nsgs,
                                         simData=self.simData)
        sla_flows = []

        flow_cnt = 0
        sla_status = 0
        sla_prob_new = 0.6
        write_data = []
        chunk_size = es_chunk_size
        with open('log/flowstats_new.log', 'w') as flowstats:
            timestamp = startTime
            t_increment = 0
            while timestamp != endTime:
                timestamp = startTime + t_increment * 1000
                i = 0
                sla_status_ts = random.randint(0,2)
                for flow_entry in pre_flows:
                    flow_record = {}
                    s_vport = flow_entry["src_vport"]
                    d_vport = flow_entry["dest_vport"]
                    dom = s_vport["domain"]
                    src_nsgid = s_vport["nsg_id"]
                    src_nsgname = s_vport["nsg_name"]
                    src_vportId = s_vport["vport_id"]
                    src_vportName = s_vport["vport_name"]
                    src_ip = s_vport["vport_ip"]
                    src_port = s_vport["port"]
                    dest_ip = d_vport["vport_ip"]
                    dest_port = d_vport["port"]
                    proto = flow_entry["Proto"]
                    srcUp = randint(0, 1)
                    destUp = randint(0, 1)
                    l7 = flow_entry["l7_class"]
                    appid = flow_entry["app_id"]
                    appname = flow_entry["app_name"]
                    appgrpid = flow_entry["app_grp"]
                    appgrpname = flow_entry["app_grp_name"]
                    # appgrpid = flow_entry["app_grp"]
                    if self.l7s[l7] in l7_to_in_bytes.keys():
                        inbytes = l7_to_in_bytes.get(self.l7s[l7])
                    else:
                        inbytes = randint(100, 4048)
                    if self.l7s[l7] in l7_to_in_pkts.keys():
                        inpkts = l7_to_in_pkts.get(self.l7s[l7])
                    else:
                        inpkts = randint(0, 10)
                    ingressMB = float(inbytes) / 1048576
                    underlayId = random.randrange(0, 10)
                    if self.slastatus[sla_status_ts] == "OutSla":
                        if appname in self.outslaApps:
                            flow_entry["timestamp"] = timestamp
                            sla_flows.append(flow_entry.copy())
                            sla_status = 1
                        else:
                            sla_status = 0
                    elif self.slastatus[sla_status_ts] == "InSla":
                        sla_status = 0

                    # flow record tuples
                    i += 1
                    flow_record["timestamp"] = long(timestamp)
                    flow_record["Domain"] = dom
                    flow_record["EnterpriseName"] = self.def_ent_name
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
                    flow_record["SrcUplink"] = self.srcUplinks[srcUp]
                    flow_record["DstUplink"] = self.destUplinks[destUp]
                    flow_record["L7Classification"] = self.l7s[l7]
                    flow_record["AppID"] = appid
                    flow_record["Application"] = appname
                    flow_record["AppGroupID"] = appgrpid
                    flow_record["APMGroup"] = appgrpname
                    ingress_prob = get_random_with_prob(0.5)
                    if ingress_prob:
                        flow_record["IngressBytes"] = inbytes
                        flow_record["IngressMB"] = ingressMB
                        flow_record["IngressPackets"] = inpkts
                    else:
                        flow_record["IngressBytes"] = 0
                        flow_record["IngressMB"] = 0
                        flow_record["IngressPackets"] = 0

                    if not ingress_prob:
                        flow_record["EgressBytes"] = inbytes
                        flow_record["EgressMB"] = float(inbytes) / 1048576  # TODO: What is this number ?
                        flow_record["EgressPackets"] = inpkts
                    else:
                        flow_record["EgressBytes"] = 0
                        flow_record["EgressMB"] = 0
                        flow_record["EgressPackets"] = 0

                    flow_record["TotalBytesCount"] = inbytes + inbytes
                    flow_record["TotalMB"] = float(flow_record["TotalBytesCount"]) / 1048576

                    flow_record["TotalPacketsCount"] = inpkts + inpkts
                    flow_record["DstNSG"] = src_nsgid
                    flow_record["DestinationNSG"] = src_nsgname
                    flow_record["SlaStatus"] = self.slastatus[sla_status]
                    flow_record["HasSwitchedPaths"] = self.hasswitchedpath[sla_status]
                    flow_record["L7ClassEnhanced"] = self.l7s[l7]
                    flow_record["UnderlayID"] = underlayId
                    flow_record["UnderlayName"] = "Underlay"+str(underlayId)
                    json.dump(flow_record, flowstats, default=json_serial)
                    flowstats.write("\n")
                    index_name = "nuage_dpi_flowstats" + '_' + self.es_index_prefix
                    flow_record['_index']= index_name
                    flow_record['_type'] = 'nuage_doc_type'
                    write_data.append(flow_record.copy())
                    if len(write_data)>=chunk_size:
                        helpers.bulk(self.es,iter(write_data),request_timeout=50)
                        write_data = []

                    flow_cnt += 1
                t_increment += 30
        if len(write_data):
            helpers.bulk(self.es,iter(write_data),request_timeout=50)
        print "flow_cnt = "+ str(flow_cnt)
        return sla_flows



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
        self.duc_grps = flowData["duc_grps"]

    def generate_probe_stats(self, startTime, endTime,es_chunk_size):
        nsgs = self.nsgs
        # app_grps = self.appgrps
        srcuplinks = self.srcUplinks
        destuplinks = self.destUplinks
        domains = self.domains
        npm_grps = self.npm_grps
        probe_cnt = 0
        firstTS = True
        control_down_prob = 0.005
        write_data = []
        chunk_size = es_chunk_size
        with open('log/probestats_new.log', 'w') as probestats:
            timestamp = startTime
            t_increment = 0
            while timestamp != endTime:
                # timestamp = startTime + datetime.timedelta(0, t_increment)
                timestamp = startTime + t_increment * 1000
                for s_nsg_ind, src_nsg in enumerate(nsgs):
                    initPacket = 1
                    d_nsg_ind = s_nsg_ind + 1
                    while d_nsg_ind < len(nsgs):
                        probe_record = {}
                        # d_nsg_ind = s_nsg_ind
                        # while d_nsg_ind == s_nsg_ind:
                        #     d_nsg_ind = random.randrange(0, len(nsgs) - 1)
                        dest_nsg = nsgs[d_nsg_ind]
                        srcUp = randint(0, 1)
                        destUp = randint(0, 1)
                        domain = randint(0, len(domains) - 1)
                        npm_grp = random.choice(npm_grps)
                        duc_grp = random.choice(self.duc_grps)
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
                        probe_record["AvgDelay"] = float(avg_latency)
                        probe_record["AvgJitter"] = float(avg_jitter)
                        probe_record["AvgPktLoss"] = float(avg_pktloss)
                        probe_record["ConfigAvgDelay"] = 200.0
                        probe_record["ConfigAvgJitter"] = 50.0
                        probe_record["ConfigAvgPktLoss"] = 50.0
                        probe_record["Domain"] = domains[domain]
                        probe_record["EnterpriseName"] = self.def_ent_name
                        probe_record["ControlSessionState"] = self.contro_states[0]
                        underlayId = random.randrange(0, 10)
                        probe_record["UnderlayID"] = underlayId
                        probe_record["UnderlayName"] = "Underlay"+str(
                            underlayId)
                        probe_record["DUCGroupID"] = duc_grp["duc_id"]
                        probe_record["DUCGroup"] = duc_grp["duc_name"]

                        if firstTS and initPacket == 1:
                            probe_record["ControlSessionState"] = self.contro_states[2]
                            del probe_record["AvgDelay"]
                            del probe_record["AvgJitter"]
                            del probe_record["AvgPktLoss"]
                            initPacket = 0
                        else:
                            if get_random_with_prob(control_down_prob):
                                probe_record["ControlSessionState"] = self.contro_states[3]
                                del probe_record["AvgDelay"]
                                del probe_record["AvgJitter"]
                                del probe_record["AvgPktLoss"]

                        json.dump(probe_record, probestats,
                                  default=json_serial)
                        probestats.write("\n")
                        index_name = "nuage_dpi_probestats" + '_' + self.es_index_prefix
                        probe_record['_index']=index_name
                        probe_record['_type'] = 'nuage_doc_type'
                        write_data.append(probe_record.copy())
                        if len(write_data)>=chunk_size:
                            helpers.bulk(self.es,iter(write_data),request_timeout=50)
                            write_data = []
                        probe_cnt += 1
                        d_nsg_ind += 1
                if len(write_data):
                    helpers.bulk(self.es,iter(write_data),request_timeout=50)
                    write_data = []
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

    def generate_sla_stats(self, sla_flows,es_chunk_size):
        nsgs = self.nsgs
        srcuplinks = self.srcUplinks
        destuplinks = self.destUplinks
        l4class = self.l4class
        sla_cnt = 0
        write_data = []
        chunk_size = es_chunk_size
        with open('log/slastats_new.log', 'w') as slastats:
            for flow_entry in sla_flows:
                sla_record = {}
                s_vport = flow_entry["src_vport"]
                d_vport = flow_entry["dest_vport"]
                dom = s_vport["domain"]
                src_nsgid = s_vport["nsg_id"]
                src_nsgname = s_vport["nsg_name"]

                while True:
                    dest_nsg = random.choice(nsgs)
                    if dest_nsg["nsg_name"] != src_nsgname:
                        break
                src_ip = s_vport["vport_ip"]
                src_port = s_vport["port"]
                dest_ip = d_vport["vport_ip"]
                dest_port = d_vport["port"]

                srcUp = randint(0, 1)
                destUp = randint(0, 1)

                appid = flow_entry["app_id"]
                appname = flow_entry["app_name"]
                appgrpid = flow_entry["app_grp"]
                appgrpname = flow_entry["app_grp_name"]
                l4_class = get_random_with_prob(self.sla_prob)
                sla_type = random.randint(0, len(self.slatype) - 1)
                violation = self.slatype[sla_type]

                # sla record tuples

                sla_record["timestamp"] = long(flow_entry["timestamp"])
                sla_record["SrcNSG"] = src_nsgid
                sla_record["SourceNSG"] = src_nsgname
                sla_record["DstNSG"] = dest_nsg["nsg_id"]
                sla_record["DestinationNSG"] = dest_nsg["nsg_name"]
                sla_record["SrcUplink"] = srcuplinks[srcUp]
                sla_record["DstUplink"] = destuplinks[destUp]
                sla_record["AppGroupID"] = appgrpid
                sla_record["APMGroup"] = appgrpname
                sla_record["Application"] = appname
                sla_record["AppID"] = appid
                sla_record["L4Classification"] = l4class[l4_class]
                sla_record["ViolationType"] = violation
                sla_record["Domain"] = dom
                sla_record["EnterpriseName"] = self.def_ent_name
                sla_record["SrcIp"] = src_ip
                sla_record["SrcPort"] = src_port
                sla_record["DstIp"] = dest_ip
                sla_record["DstPort"] = dest_port

                json.dump(sla_record, slastats,
                          default=json_serial)
                slastats.write("\n")
                index_name = "nuage_dpi_slastats" + '_' + self.es_index_prefix
                sla_record['_index'] = index_name
                sla_record['_type']='nuage_doc_type'
                write_data.append(sla_record.copy())
                if len(write_data)>=chunk_size:
                    helpers.bulk(self.es,iter(write_data),request_timeout=50)
                    write_data = []
                sla_cnt += 1
        if len(write_data):
            helpers.bulk(self.es,iter(write_data),request_timeout=50)
            write_data = []
        print "sla_cnt = " + str(sla_cnt)


class SimulateNATTStats(object):
    def __init__(self, flowData):
        self.nsgs = flowData["nsgs"]
        self.def_ent_name = flowData["def_ent_name"]
        self.es = flowData["es"]
        self.es_index_prefix = flowData["es_index_prefix"]
        self.srcUplinks = flowData["srcuplinks"]
        self.destUplinks = flowData["destuplinks"]
        self.natt_summaries = ["Green","Orange","Red"]

    def generate_natt_stats(self, startTime, endTime,es_chunk_size):
        nsgs = self.nsgs
        srcuplinks = self.srcUplinks
        destuplinks = self.destUplinks
        natt_stat_cnt = 0
        write_data = []
        chunk_size = es_chunk_size
        with open('log/nattstats_new.log', 'w') as nattstats:
            timestamp = startTime
            t_increment = 0
            while timestamp != endTime:
                timestamp = startTime + t_increment * 1000
                for s_nsg_ind, src_nsg in enumerate(nsgs):

                    d_nsg_ind = s_nsg_ind + 1
                    while d_nsg_ind < len(nsgs):
                        nattstat_record = {}
                        dest_nsg = nsgs[d_nsg_ind]
                        srcUp = randint(0, 1)
                        destUp = randint(0, 1)
                        nattstat_record["timestamp"] = long(timestamp)
                        nattstat_record["SrcNSG"] = src_nsg["nsg_id"]
                        nattstat_record["SourceNSG"] = src_nsg["nsg_name"]
                        nattstat_record["DstNSG"] = dest_nsg["nsg_id"]
                        nattstat_record["DestinationNSG"] = dest_nsg["nsg_name"]
                        nattstat_record["SrcUplink"] = srcuplinks[srcUp]
                        nattstat_record["DstUplink"] = destuplinks[destUp]
                        nattstat_record["SrcUplinkIndex"] = srcuplinks[srcUp]
                        nattstat_record["DstUplinkIndex"] = destuplinks[destUp]
                        nattstat_record["SrcUplinkRole"] = srcuplinks[srcUp]
                        nattstat_record["DstUplinkRole"] = destuplinks[destUp]
                        nattstat_record["EnterpriseName"] = self.def_ent_name

                        nattstat_record["VscVxLanIP"] = src_nsg["nsg_natt_ip"]
                        nattstat_record["VscVxLanPort"] = src_nsg["nsg_natt_port"]
                        nattstat_record["VscIPSecIP"] = src_nsg["nsg_natt_ip"]
                        nattstat_record["VscIPSecPort"] = src_nsg["nsg_natt_port"]
                        nattstat_record["ProbeVxLanIP"] = src_nsg["nsg_natt_ip"]
                        nattstat_record["ProbeVxLanPort"] = src_nsg["nsg_natt_port"]
                        nattstat_record["ProbeIPSecIP"] = src_nsg["nsg_natt_ip"]
                        nattstat_record["ProbeIPSecPort"] = src_nsg["nsg_natt_port"]

                        nattstat_record["Reason"] = "Reason"


                        json.dump(nattstat_record, nattstats,
                                  default=json_serial)
                        nattstats.write("\n")
                        index_name = "nuage_nat-t" + '_' + self.es_index_prefix
                        nattstat_record['_index']=index_name
                        nattstat_record['_type'] = 'nuage_doc_type'
                        write_data.append(nattstat_record.copy())
                        if len(write_data)>=chunk_size:
                            helpers.bulk(self.es,iter(write_data),request_timeout=50)
                            write_data = []
                        natt_stat_cnt += 1
                        d_nsg_ind += 1
                if len(write_data):
                    helpers.bulk(self.es,iter(write_data),request_timeout=50)
                    write_data = []
                t_increment += 30

        print "natt_stat_cnt = " + str(natt_stat_cnt)

    def generate_natt_summary(self, startTime, endTime,es_chunk_size):
        nsgs = self.nsgs
        natt_summary_cnt = 0
        write_data = []
        chunk_size = es_chunk_size
        with open('log/natt_summary_new.log', 'w') as natt_summary:
            timestamp = startTime
            t_increment = 0
            while timestamp != endTime:
                timestamp = startTime + t_increment * 1000
                for s_nsg_ind, src_nsg in enumerate(nsgs):
                    d_nsg_ind = s_nsg_ind + 1
                    while d_nsg_ind < len(nsgs):
                        natt_summary_record = {}
                        dest_nsg = nsgs[d_nsg_ind]
                        natt_summary_record["timestamp"] = long(timestamp)
                        natt_summary_record["EnterpriseName"] = self.def_ent_name
                        natt_summary_record["SrcNSG"] = src_nsg["nsg_id"]
                        natt_summary_record["SourceNSG"] = src_nsg["nsg_name"]
                        natt_summary_record["DstNSG"] = dest_nsg["nsg_id"]
                        natt_summary_record["DestinationNSG"] = dest_nsg["nsg_name"]
                        natt_status = random.choice([0,1,2])
                        natt_summary_record["ReachabilityStatus"] = self.natt_summaries[natt_status]

                        json.dump(natt_summary_record, natt_summary,
                                  default=json_serial)
                        natt_summary.write("\n")
                        index_name = "nuage_nat-t" + '_' + self.es_index_prefix
                        natt_summary_record['_index']=index_name
                        natt_summary_record['_type'] = 'nuage_doc_type'
                        write_data.append(natt_summary_record.copy())
                        if len(write_data)>=chunk_size:
                            helpers.bulk(self.es,iter(write_data),request_timeout=50)
                            write_data = []
                        natt_summary_cnt += 1
                        d_nsg_ind += 1
                if len(write_data):
                    helpers.bulk(self.es,iter(write_data),request_timeout=50)
                    write_data = []
                t_increment += 30

        print "natt_summary_cnt = " + str(natt_summary_cnt)

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
    defData["natt_ip_prefix"] = config.get('default', 'natt_ip_prefix')
    defData["natt_port"] = config.get('default', 'natt_port')
    defData["domain_count"] = config.getint('default', 'domain_count')
    defData["npm_count"] = config.getint('default', 'npm_count')
    defData["perf_mon_count"] = config.getint('default', 'perf_mon_count')
    #print config.getint('default', 'duc_count')
    defData["duc_count"] = config.getint('default', 'duc_count')
    #print defData["duc_count"]
    defData['out_sla_app_count'] = config.getint('default','out_sla_apps')

    def_ent_name = config.get('default', 'def_ent_name')
    es_server = config.get('default', 'es_server')
    es_chunk_size = config.getint('default','es_chunk_size')

    startTime = float(int(time.time())) * 1000 - (24 * 60 * 60 * 1000)
    endTime = float(int(time.time()))*1000
    es_index_prefix = (datetime.datetime.fromtimestamp(startTime/1000)).strftime('%Y_%m_%d')

    simData = SimulateAARData(defData)
    es = Elasticsearch(es_server)


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

    ducgrpids = simData.getDucGrpIds()
    outslaApps = simData.getOutSlaApps()


    flowData = {
        "nsgs": nsgs,
        "app_grps": appgrpids,
        "srcuplinks": srcuplinks,
        "destuplinks": destuplinks,
        "domains": domains,
        "def_ent_name": def_ent_name,
        "es": es,
        "es_index_prefix": es_index_prefix,
        "npm_grps": npm_grps,
        "duc_grps": ducgrpids,
        "protos": protos,
        "l7s": l7s,
        "outslaApps": outslaApps,
        "perf_mons": perf_mons
    }

    flow_stats = SimulateFlowStats(flowData, simData)
    sla_flows = flow_stats.generate_flow_stats(startTime, endTime,es_chunk_size)

    probe_stats = SimulateProbeStats(flowData)
    probe_stats.generate_probe_stats(startTime, endTime,es_chunk_size)

    sla_stats = SimulateSLAStats(flowData)
    sla_stats.generate_sla_stats(sla_flows,es_chunk_size)

    natt_stats = SimulateNATTStats(flowData)
    natt_stats.generate_natt_stats(startTime, endTime,es_chunk_size)
    natt_stats.generate_natt_summary(startTime, endTime,es_chunk_size)


if __name__ == '__main__':
    main()
