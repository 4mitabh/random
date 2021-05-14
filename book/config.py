from datetime import timedelta, datetime

CONFIG_NAME='default'

CONFIG={
  'default':{
      'PINCODES' : [622], #list of pincodes or district codes.     294:BLR, 506:JPR,    
      'REGISTERED_MOBILE_NUMBER' : 7829037733, # 10 digit mobile number in int 
      'BENEFICIARIES_IDS' : [''] # beneficiary_reference_id. Leave blank to get a list.
   },
  'rtm':
    {'PINCODES' : [457001], 
    'REGISTERED_MOBILE_NUMBER' : 9340787767,
    'BENEFICIARIES_IDS' : []
    },
  'blr':
    {'PINCODES' : [294], 
    'REGISTERED_MOBILE_NUMBER' : 7829037733 ,
    'BENEFICIARIES_IDS' : []
    },
  'jpr':
    {'PINCODES' : [506], 
    'REGISTERED_MOBILE_NUMBER' : 7829037733 ,
    'BENEFICIARIES_IDS' : []
    },
  'idr':
    {'PINCODES' : [314], 
    'REGISTERED_MOBILE_NUMBER' :  7000594615 ,
    'BENEFICIARIES_IDS' : ['50217653146430', '64218666619590', '19324407056970', '68451404324530']
    },
  'ujn':
    {'PINCODES' : [318], 
    'REGISTERED_MOBILE_NUMBER' : 7999572304 ,
    'BENEFICIARIES_IDS' : []
    }
}
headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Content-Type': 'application/json',
    'Origin': 'https://selfregistration.cowin.gov.in',
    'Connection': 'keep-alive',
    'Referer': 'https://selfregistration.cowin.gov.in/',
    'TE': 'Trailers',
}

LIMIT = 3 #otp retry limit
DATE = (datetime.today() + timedelta(0)).strftime("%d-%m-%Y")
PINCODES=CONFIG[CONFIG_NAME]['PINCODES']
REGISTERED_MOBILE_NUMBER=CONFIG[CONFIG_NAME]['REGISTERED_MOBILE_NUMBER']
BENEFICIARIES_IDS=CONFIG[CONFIG_NAME]['BENEFICIARIES_IDS']

