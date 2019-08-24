from ftplib import FTP
from sys import argv
from serci_settings import *

def kek(lol):
    print(lol)


def main():
    filename = argv[1]
    with FTP('ftp.serci.org') as ftp:
            ftp.login(username, password)
            
            list_of_byte_lines = []
            ftp.retrbinary("RETR %s" % filename, lambda x: list_of_byte_lines.append(x))
            
            list_of_lines = []
            for byte_line in list_of_byte_lines:
                list_of_lines.append(byte_line.decode())
                
            print("".join(list_of_lines))
                
                
            
if __name__ == "__main__":
    main()