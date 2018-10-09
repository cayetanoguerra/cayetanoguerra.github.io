import requests
from bs4 import BeautifulSoup


def getProductsAndPrices(url):
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }

    # open with GET method
    resp = requests.get(url, headers=headers)

    # http_respone 200 means OK status
    if resp.status_code == 200:
        soup = BeautifulSoup(resp.text, 'html.parser')
        products = soup.find_all(id="categoryProductContainer")
        pl = [(p.find(attrs="product1Description").text.replace("\n", ""),
               p.find(attrs="product1Price").text.replace("\n", "")) for p in products]
        return pl
    else:
        print("Error")


l = getProductsAndPrices("https://tiendas.mediamarkt.es/televisores")

for e in l:
    print(e[0])
    print(e[1])
    print("-------------------------")
