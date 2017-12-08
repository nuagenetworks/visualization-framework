export const NetworkProtocols = [
    {
        text: 'Any',
        value: 'ANY',
    },
    {
        text: 'ICMP - 1',
        value: '1',
    },
    {
        text: 'IGMP - 2',
        value: '3',
    },
    {
        text: 'GGP - 3',
        value: '3',
    },
    {
        text: 'IPv4 - 4',
        value: '4',
    },
    {
        text: 'ST - 5',
        value: '5',
    },
    {
        text: 'TCP - 6',
        value: '6',
    },
    {
        text: 'CBT - 7',
        value: '7',
    },
    {
        text: 'EGP - 8',
        value: '8',
    },
    {
        text: 'IGP - 9',
        value: '9',
    },
    {
        text: 'BBN_RCC_MON - 10',
        value: '10',
    },
    {
        text: 'NVP_II - 11',
        value: '11',
    },
    {
        text: 'PUP - 12',
        value: '12',
    },
    {
        text: 'ARGUS - 13',
        value: '13',
    },
    {
        text: 'EMCON - 14',
        value: '14',
    },
    {
        text: 'XNET - 15',
        value: '15',
    },
    {
        text: 'CHAOS - 16',
        value: '16',
    },
    {
        text: 'UDP - 17',
        value: '17',
    },
    {
        text: 'MUX - 18',
        value: '18',
    },
    {
        text: 'DCN_MEAS - 19',
        value: '19',
    },
    {
        text: 'HMP - 20',
        value: '20',
    },
    {
        text: 'PRM - 21',
        value: '21',
    },
    {
        text: 'XNS_IDP - 22',
        value: '22',
    },
    {
        text: 'TRUNK_1 - 23',
        value: '23',
    },
    {
        text: 'TRUNK_2 - 24',
        value: '24',
    },
    {
        text: 'LEAF_1 - 25',
        value: '25',
    },
    {
        text: 'LEAF_2 - 26',
        value: '26',
    },
    {
        text: 'RDP - 27',
        value: '27',
    },
    {
        text: 'IRTP - 28',
        value: '28',
    },
    {
        text: 'ISOTP4 - 29',
        value: '29',
    },
    {
        text: 'NETBLT - 30',
        value: '30',
    },
    {
        text: 'MFE_NSP - 31',
        value: '31'
    },
    {
        text: 'MERIT_INPP - 32',
        value: '32'
    },
    {
        text: 'DCCP - 33',
        value: '33'
    },
    {
        text: '3PC - 34',
        value: '34'
    },

];
/*
text: 'IDPR - 35',
text: 'XTP - 36',
text: 'DDP - 37',
text: 'IDPR_CMTP - 38',
text: 'TP++ - 39',
text: 'IL - 40',
text: 'IPv6 - 41',
text: 'SDRP - 42',
text: 'IPv6_ROUTE - 43',
text: 'IPv6_FRAG - 44',
text: 'IDRP - 45',
text: 'RSVP - 46',
text: 'GRE - 47',
text: 'DSR - 48',
text: 'BNA - 49',
text: 'ESP - 50',
text: 'AH - 51',
text: 'I_NLSP - 52',
text: 'SWIPE - 53',
text: 'NARP - 54',
text: 'MOBILE - 55',
text: 'TLSP - 56',
text: 'SKIP - 57',
text: 'IPv6_ICMP - 58',
text: 'IPv6_NONXT - 59',
text: 'IPv6_OPTS - 60',
text: 'Any internal protocols - 61',
text: 'CFTP - 62',
text: '63 - Any local network - 63',
text: 'SAT_EXPAK - 64',
text: 'KRYPTOLAN - 65',
text: 'RVD - 66',
text: 'IPPC - 67',
text: 'Any distributed file system - 68',
text: 'SAT_MON - 69',
text: 'VISA - 70',
text: 'IPCV - 71',
text: 'CPNX - 72',
text: 'CPHB - 73',
text: 'WSN - 74',
text: 'PVP - 75',
text: 'BR_SAT_MON - 78',
text: 'SUN_ND - 77',
text: 'WB_MON - 78',
text: 'WB_EXPAK - 79',
text: 'ISO_IP - 80',
text: 'VMTP - 81',
text: 'SECURE_VMTP - 82',
text: 'VINES - 83',
text: 'TTP - 84',
text: 'IPTM - 84',
text: 'NSFNET_IGP - 85',
text: 'DGP - 86',
text: 'TCF - 87',
text: 'EIGRP - 88',
text: 'OSPFIGP - 89',
text: 'SPRITE_RPC - 90',
text: 'LARP - 91',
text: 'MTP - 92',
text: 'AX.25 - 93',
text: 'IPIP - 94',
text: 'MICP - 95',
text: 'SCC_SP - 96',
text: 'ETHER_IP - 97',
text: 'ENCAP - 98',
text: 'Any private encryption scheme',
text: 'GMTP - 100',
text: 'IFMP - 101',
text: 'PNNI - 102',
text: 'PIM - 103',
text: 'ARIS - 104',
text: 'SCPS - 105',
text: 'QNX - 106',
text: 'A/N - 107',
text: 'IPCOMP - 108',
text: 'SNP - 109',
text: 'COMPAQ_PEER - 110',
text: 'IPX_IN_IP - 111',
text: 'VRRP - 112',
text: 'PGM - 113',
text: 'Any 0-hop protocol - 114',
text: 'L2TP - 115',
text: 'DDX - 116',
text: 'IATP - 117',
text: 'STP - 118',
text: 'SRP - 119',
text: 'UTI - 120',
text: 'SMP - 121',
text: 'SM - 122',
text: 'PTP - 123',
text: 'ISIS_OVER_IPv4 - 124',
text: 'FIRE - 125',
text: 'CRTP - 126',
text: 'CRUDP - 126',
text: 'SSCOPMCE - 127',
text: 'IPLT - 129',
text: 'SPS - 130',
text: 'PIPE - 131',
text: 'SCTP - 132',
text: 'FC - 133',
text: 'RSVP_E2E_IGNORE - 134',
text: 'MOBILITY_HEADER - 135',
text: 'UDPLITE - 136',
text: 'MPLS_IN_IP - 137',
text: 'MANET - 138',
text: 'HIP - 139',
text: 'SHIM6 - 140',
text: 'WESP - 141',
text: 'ROHC - 142',
text: 'Testing 1 - 253',
text: 'Testing 2 - 254',
*/

export const NetworkTypeOptions = [
    {
        text: 'Any',
        value: 'ANY'
    },
    {
        text: 'Zone',
        value: 'ZONE'
    },
    {
        text: 'Subnet',
        value: 'SUBNET'
    },
    {
        text: 'Network Macro',
        value: 'ENTERPRISE_NETWORK'
    },
    {
        text: 'Network Macro Group',
        value: 'NETWORK_MACRO_GROUP'
    },
    {
        text: 'Policy Group',
        value: 'POLICYGROUP'
    },
    {
        text: 'Policy Group Expression',
        value: 'PGEXPRESSION'
    },
    {
        text: 'Underlay Internet Policy Group',
        value: 'UNDERLAY_INTERNET_POLICYGROUP'
    },
];

export const SecurityPolicyActions = [
    {
        text: 'Allow',
        value: 'FORWARD',
    },
    {
        text: 'Drop',
        value: 'DROP',
    }
];

export const MirrorDestinationOptions = [
    {
        text: 'Overlay Mirror Destination',
        value: 'l2domainID',
        label: 'L2 Domain',
    },
    {
        text: 'Underlay Mirror Destination',
        value: 'mirrorDestinationID',
        label: 'Mirror Destination',
    }
];

export const getNetworkProtocolForValue = (value) => {
    const protocols = NetworkProtocols.filter(item => item.value.startsWith(value));

    return protocols && Array.isArray(protocols) && protocols.length > 0 ? protocols[0].value : null;
}
export const getNetworkProtocolForText = (text) => {
    const protocols = NetworkProtocols.filter(item => item.text.startsWith(text));

    return protocols && Array.isArray(protocols) && protocols.length > 0 ? protocols[0].value : null;
}

export const getSecurityPolicyActionsForValue = (value) => {
    var re = new RegExp(value, 'gi');
    return SecurityPolicyActions.filter(item => item.value.match(re));
}

export const getNetworkTypeForValue = (value) => {
    return NetworkTypeOptions.filter(item => item.value === value);
}

export const getMirrorDestinationForValue = (value) => MirrorDestinationOptions.filter(item => item.value === value)
