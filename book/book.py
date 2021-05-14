from login import *
from datetime import timedelta, datetime
import subprocess

def get_beneficiaries():
    bids=[]
    beneficiaries = session.get('https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries')
    if beneficiaries.status_code == 200:
        print("Successfully Fetch Beneficiaries")
        print(beneficiaries.json())
    else:
        print(f"Beneficiaries Status_code: {beneficiaries.status_code}\n{beneficiaries.text}")
    
    for i in beneficiaries.json()['beneficiaries']:
      if (i['vaccination_status'] == 'Not Vaccinated' and int(i['birth_year']) > 1976 ):        
        bids.append(i['beneficiary_reference_id'])
        print(f"{i['beneficiary_reference_id']} : {i['name']}")
    return bids


def book_slot(book):
    print(f"Trying to book: {book}")
    get_captcha()
    book["captcha"] = input("Enter Captcha:")
    book = json.dumps(book)
    resp = session.post("https://cdn-api.co-vin.in/api/v2/appointment/schedule", data=book)
    
    print (book)

    
    if resp.status_code == 200:
        print("Scheduled Successfully.")
        print(f"response: {resp.json()}")
        return True
    else:
        print(f"booking error. {resp.status_code}\n{resp.text}")
        return False

def get_captcha():
    out = session.post("https://cdn-api.co-vin.in/api/v2/auth/getRecaptcha")
    if out.status_code == 200:
        captcha = out.json()['captcha']                                                                                                                                                                     
        with open("svg.html", "w") as f: 
            f.write(captcha)
        print("captcha downloaded successfully")
        subprocess.call(('open', "svg.html"))
      

def book_appointment():
    dose=1
    print(f"\n 'BENEFICIARIES_IDS': {BENEFICIARIES_IDS} ")
    for i in PINCODES:
        if (len(f"{i}")==6):
          url = f"https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode={i}&date={DATE}"
          print(f"\n Checking PINCODE {i} : {url} ")
        else:
          url = f"https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id={i}&date={DATE}"
          print(f"\n Checking DISTRICT {i} : {url} ")
        out = session.get(url)
        if out.status_code == 200:
            for j in reversed(out.json()['centers']):
                for sessions in reversed(j['sessions']):
                    if sessions['available_capacity'] > 0 and sessions['min_age_limit'] < 45:
                      print(f"\n {sessions['available_capacity']} {sessions['vaccine']} on {sessions['date']} at {j['name']}. \n{j['address']} {j['block_name']} {j['district_name']}  {j['state_name']}  {j['pincode']}.")
                    if sessions['available_capacity'] >= len(BENEFICIARIES_IDS) and sessions['min_age_limit'] < 45:
                        book = {
                            "center_id": j['center_id'],
                            "session_id": sessions['session_id'],
                            "beneficiaries": BENEFICIARIES_IDS,
                            "slot": "09:00AM-11:00AM", #sessions['slots'][0],
                            "dose": dose
                        }
                        print (f"\n Trying to book this...")
                        stop = book_slot(book)
                        if stop:
                            print("booking successfull")
                            return True
        else:
            print(f"status code: {out.status_code}")
            print(f"response: {out.text}")

def parse_args():
    global DATE, PINCODES,REGISTERED_MOBILE_NUMBER,BENEFICIARIES_IDS,CONFIG_NAME
    args = sys.argv[1:]
    args.sort(reverse=True)
    print (args)
    for arg in  args:
      if len(arg) == 2 and arg.isdigit():        
          DATE = arg + (datetime.today() + timedelta(1)).strftime("-%m-%Y")
          print(f"Override date {DATE}")
      elif len(arg) == 6 and arg.isdigit():    
          PINCODES=[arg]
          print(f"Override PIN {PINCODES}")
      else:
          CONFIG_NAME=arg
          print(f"Override Config {arg}")
          PINCODES=CONFIG[CONFIG_NAME]['PINCODES']
          REGISTERED_MOBILE_NUMBER=CONFIG[CONFIG_NAME]['REGISTERED_MOBILE_NUMBER']
          BENEFICIARIES_IDS=CONFIG[CONFIG_NAME]['BENEFICIARIES_IDS']
          
def printParams():
    print(f"Config {CONFIG_NAME}")
    print(f"Date {DATE}")
    print(f"PINs {PINCODES}")
    print(f"Mobile {REGISTERED_MOBILE_NUMBER}")
    print(f"Ids {BENEFICIARIES_IDS}")

def check_other_pins():
    global PINCODES
    pin = input(f"Try aynother PIN code? { PINCODES }: ")
    if (len(pin)>=3):
      PINCODES = [pin]

        
if __name__ == '__main__':
    parse_args()
    printParams()

    out = get_authenticated_session(REGISTERED_MOBILE_NUMBER)
    if out == False:
        print("Failed to login")
        exit()
    if (len(BENEFICIARIES_IDS)==0):
        print("Please add beneficiary_reference_id to config")
        BENEFICIARIES_IDS=get_beneficiaries()
    while (book_appointment()!=True):
        check_other_pins()
