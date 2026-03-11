import uuid
from curl_cffi import requests
import time
import re
headers.update({'x-session-token': token})
login_resp = requests.get(
    "https://www.5rr99.com/wps/game/launchGame",
    params={
        "gameId": "PG0143",
        "nodeId": "183114",
        "accountType": 1,
        "confirmTrans": 0,
        "vassalage": "PG",
        "launchMode": "GLS",
        "platform": "html5-desktop",
        "clientType": 3,
        "language": "EN",
        "merchantCode": "rr99vndkf7"
    },
    headers=headers,
    impersonate="chrome101",
    timeout=15
)
from urllib.parse import urlparse, parse_qs
msg_url = login_resp.json()["value"]["content"]["game_url"]
print(msg_url)
headers_urrl = {
'Authority': 'mgs.58488920.com',
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
'Accept-Encoding': 'gzip, deflate, br, zstd',
'Accept-Language': 'en-US,en;q=0.9',
'Connection': 'keep-alive',
'Referer': 'https://www.rr99.asia/',
'Sec-Ch-Ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
'Sec-Ch-Ua-Mobile': '?0',
'Sec-Ch-Ua-Platform': '"Windows"',
'Sec-Fetch-Dest': 'iframe',
'Sec-Fetch-Mode': 'navigate',
'Sec-Fetch-Site': 'cross-site',
'Sec-Fetch-Storage-Access': 'active',
'Sec-Fetch-User': '?1',
'Upgrade-Insecure-Requests': '1',
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
}
response = requests.get(
    msg_url,
    headers=headers_urrl,
    impersonate="chrome101",
    timeout=15
)
html_content = response.text
pattern = r'\("([a-zA-Z0-9+\/={]{500,})"\)'
match = re.search(pattern, html_content)
if match:
    base64_str = match.group(1)
    print("Đã lấy được chuỗi!")
else:
    print("Không tìm thấy chuỗi, có thể bạn vẫn đang bị Cloudflare chặn.")
raw_result = decode_data(base64_str)
if isinstance(raw_result, str):
    data = json.loads(raw_result)
else:
    data = raw_result
first_server = data.get("f", [{}])[0]
target_url = first_server.get("u", "")

parsed = urlparse(target_url)
params_url = parse_qs(parsed.query)

btt = params_url.get("btt", [None])[0]
ops = params_url.get("ops", [None])[0]
otk = params_url.get("ot", [None])[0]
lang = params_url.get("l", ["en"])[0]
game_id =1508783
def pick_allin(self, balance, mxl):
    cs_list = [5.00, 1.00, 0.20, 0.02] 
    base = 20

    for cs in cs_list:
        # Thử ml từ 10 xuống 1
        for ml in range(10, 0, -1):
            bet = round(cs * ml * base, 2)
            if bet <= balance and bet <= mxl:
                return cs, ml, bet
                
    return None, None, 0

verify_resp = requests.post(
    "https://api.waywubi83.com/web-api/auth/session/v2/verifyOperatorPlayerSession",
    params={"traceId": uuid.uuid4().hex[:8].upper()},
    data={
        "btt": btt,
        "vc": "2",
        "pf": "1",
        "l": lang,
        "gi": game_id,
        "os": ops,
        "otk": otk
    },
        proxies=self.proxies,
    headers=headers_urrl,
    impersonate="chrome101",
    timeout=15
)
print(verify_resp.json())
verify_json = verify_resp.json()
if verify_json.get("err") is not None:
    raise Exception("Verify failed", verify_json)
atk = verify_json["dt"]["tk"]
requests.post(
    "https://api.waywubi83.com/web-api/game-proxy/v2/GameName/Get",
    params={"traceId": uuid.uuid4().hex[:8].upper()},
    data={
        "lang": "en",
        "btt": btt,
        "atk": atk,
        "pf": "1",
        "gid": game_id
    },
    headers=headers_urrl,
    impersonate="chrome101",
    timeout=10
)

# ===== 7. GAMEINFO =====
gameinfo_resp = requests.post(
    f"https://api.waywubi83.com/game-api/wild-ape-3258/v2/GameInfo/Get",
    params={"traceId": uuid.uuid4().hex[:8].upper()},
    data={
        "btt": btt,
        "atk": atk,
        "pf": "1"
    },
    proxies=self.proxies,
    headers=headers_urrl,
    impersonate="chrome101",
    timeout=15
)
print(f'gameinfo_resp: ', gameinfo_resp)
gi = gameinfo_resp.json()
si = gi["dt"]["ls"]["si"]
sid = si["sid"]
balance = gameinfo_resp.json()['dt']['bl']
wk = si.get("wk", "0_C")
count = 1
last_cs, last_ml = None, None
nst = 1

while self.is_running:
    SCALE = 1000
    real_balance = balance * SCALE
    if real_balance >= self.target_bal:
        self.status_updated.emit(
            self.row_index,
            f"Đạt mục tiêu: {real_balance:,.0f}"
        )
        break
    if nst == 1:
        cs, ml, bet = self.pick_allin(balance, 500)
        if cs is None:
            break
        last_cs, last_ml = cs, ml
    else:
        cs, ml = last_cs, last_ml

    spin_data = {
        "cs": str(cs),
        "ml": str(ml),
        "pf": "1",
        "id": sid,
        "wk": wk,
        "fb": "false",
        "btt": "1",
        "atk": atk
    }

    spin_url = f"https://api.waywubi83.com/game-api/wild-ape-3258/v2/Spin"
    spin_resp = requests.post(
        spin_url,
        params={"traceId": uuid.uuid4().hex[:8].upper()},
        headers=headers_urrl,
        data=spin_data,
            proxies=self.proxies,
        impersonate="chrome101",
        timeout=20
    )

    spin_json = spin_resp.json()
    if spin_json.get("err") is not None:
        self.status_updated.emit(self.row_index, f" Lỗi: {spin_json['err']}")
        break

    si = spin_json.get("dt", {}).get("si") or spin_json.get("dt", {}).get("ls", {}).get("si", {})
    sid = si.get("sid", sid)
    balance = si.get("bl", balance)
    nst = si.get("nst", 1)

    self.balance_updated.emit(self.row_index, f"{balance:,.2f}")
    bet_amount = si.get("tb") or si.get("bet") or (cs * ml)
    win_amount = si.get("aw", 0)

    self.status_updated.emit(
        self.row_index,
        f"Ván {count} | Bet: {bet_amount} | Win: {win_amount}"
    )
    count += 1
    time.sleep(1.2)