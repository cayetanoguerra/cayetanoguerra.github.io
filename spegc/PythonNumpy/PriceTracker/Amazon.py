import requests
from bs4 import BeautifulSoup


def getPrice(url):
    
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }

    # open with GET method
    resp = requests.get(url, headers=headers)

    # http_respone 200 means OK status
    if resp.status_code == 200:
        soup = BeautifulSoup(resp.text, 'html.parser')
        price = soup.find(id="priceblock_ourprice").text
        return price
    else:
        print("Error")


print(getPrice("https://www.amazon.es/gp/product/B072BG9Z8W/ref=ox_sc_mini_detail?ie=UTF8&psc=1&smid=A1AT7YVPFBWXBL"))
