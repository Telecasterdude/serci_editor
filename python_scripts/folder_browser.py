from sys import argv
from serci_settings import *
import requests

def main():
    input_folder = argv[1]
    url = 'https://api.github.com/repos/telecasterdude/serci_website/contents/' + input_folder
    headers = {'Accept': 'application/vnd.github.v3+json', 
           'Authorization': 'token {}'.format(API_KEY)}

    req = requests.get(url, headers=headers)
    files_dict = req.json()
    for file in files_dict:
        print(file['type'], file['sha'], file['name'])
            

if __name__ == "__main__":
    main()