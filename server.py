"""Servidor do jogo: serve os arquivos estáticos e faz proxy (com cache) da API do PubChem.

Rodar:  python server.py   ->  http://localhost:8000
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from functools import lru_cache, partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/'
# número atômico -> símbolo (até o Fe, cobre todas as equações do jogo)
SIMBOLOS = 'X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe'.split()


def baixar(url):
    with urllib.request.urlopen(url, timeout=15) as r:
        return json.load(r)


@lru_cache(maxsize=256)  # erros não entram no cache, então uma falha de rede é tentada de novo
def molecula(nome):
    q = urllib.parse.quote(nome)
    props = baixar(BASE + q + '/property/MolecularFormula,MolecularWeight/JSON')['PropertyTable']['Properties'][0]
    # 3D quando existe (moléculas orgânicas); metais e sais só têm 2D no PubChem
    for tipo in ('3d', '2d'):
        try:
            c = baixar(BASE + q + '/JSON?record_type=' + tipo)['PC_Compounds'][0]
        except urllib.error.HTTPError:
            continue
        conf = c['coords'][0]['conformers'][0]
        z = conf.get('z', [0] * len(conf['x']))
        atomos = [[SIMBOLOS[e] if e < len(SIMBOLOS) else '?', x, y, zz]
                  for e, x, y, zz in zip(c['atoms']['element'], conf['x'], conf['y'], z)]
        return {'cid': props['CID'], 'formula': props['MolecularFormula'],
                'massa': float(props['MolecularWeight']), 'tipo': tipo, 'atomos': atomos}
    raise LookupError('sem coordenadas para ' + nome)


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if not self.path.startswith('/api/molecule/'):
            return super().do_GET()
        nome = urllib.parse.unquote(self.path[len('/api/molecule/'):])
        try:
            status, corpo = 200, molecula(nome)
        except Exception as e:
            status, corpo = 404, {'erro': str(e)}
        dados = json.dumps(corpo).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)


if __name__ == '__main__':
    pasta = os.path.dirname(os.path.abspath(__file__))
    print('Jogo rodando em http://localhost:8000')
    ThreadingHTTPServer(('', 8000), partial(Handler, directory=pasta)).serve_forever()
