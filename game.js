import * as THREE from 'three';

// ===== DADOS =====
// Equações já com a resposta certa (menores coeficientes inteiros).
const TUTORIAL_EQ = '2 H2 + O2 -> 2 H2O';

// Passos do tutorial. "foco" = o que piscar na tela; "pronto" = ação que o aluno precisa fazer para avançar.
const PASSOS = [
    { titulo: 'Bem-vindo!', texto: 'Numa reação química os átomos <b>não somem nem aparecem</b>, só se reorganizam (Lei de Lavoisier). Seu desafio é <b>balancear</b> a equação: deixar o mesmo número de cada átomo dos dois lados.' },
    { titulo: 'As caixas', foco: '.caixa', texto: 'À esquerda ficam os <b>reagentes</b> (o que reage) e à direita os <b>produtos</b> (o que se forma). <b>Arraste o fundo</b> de uma caixa para girar as moléculas e passe o mouse numa molécula para ver o nome.' },
    { titulo: 'Adicione hidrogênio', foco: '.arrastavel[data-l="0"][data-i="0"], #caixa0', pronto: c => c[0][0] >= 2, texto: 'Segure o <b>H₂</b> que está brilhando e <b>arraste para dentro da caixa de reagentes</b>. Precisamos de <b>2</b> moléculas de H₂!' },
    { titulo: 'Agora a água', foco: '.arrastavel[data-l="1"][data-i="0"], #caixa1', pronto: (c, r) => r === 'ok', texto: 'Agora sobram átomos de H e O nos reagentes. <b>Arraste mais uma H₂O</b> para a caixa de produtos para balancear!' },
    { titulo: 'Balanceou!', foco: '#contagemBox, #seta', confete: true, texto: 'A seta virou e a contagem ficou toda <b>verde</b>: 4 H e 2 O de cada lado. Para <b>tirar</b> uma molécula, é só arrastá-la para fora da caixa (ou usar o ▼).' },
    { titulo: 'Agora é com você', texto: 'Cada nível tem <b>5 equações</b>. Balanceie e clique em <b>Verificar</b>: acertou de primeira = 2 pontos, na segunda = 1. No jogo a contagem fica <b>escondida</b> até você verificar, e use sempre os <b>menores números</b> possíveis!' },
];

const NIVEIS = [
    ['H2 + Cl2 -> 2 HCl', '2 Na + Cl2 -> 2 NaCl', 'N2 + 3 H2 -> 2 NH3', '2 H2O2 -> 2 H2O + O2',
     'C + O2 -> CO2', '2 Mg + O2 -> 2 MgO', '2 CO + O2 -> 2 CO2', '2 H2 + O2 -> 2 H2O',
     '2 H2O -> 2 H2 + O2', 'N2 + O2 -> 2 NO', '2 SO3 -> 2 SO2 + O2', '2 K + Cl2 -> 2 KCl',
     'CaCO3 -> CaO + CO2', '2 NaHCO3 -> Na2CO3 + CO2 + H2O'],
    ['CH4 + 2 O2 -> CO2 + 2 H2O', 'C3H8 + 5 O2 -> 3 CO2 + 4 H2O', '2 SO2 + O2 -> 2 SO3',
     '2 KClO3 -> 2 KCl + 3 O2', '4 Fe + 3 O2 -> 2 Fe2O3', '2 Al + 3 Cl2 -> 2 AlCl3', 'C2H5OH + 3 O2 -> 2 CO2 + 3 H2O',
     'Mg + 2 HCl -> MgCl2 + H2', 'Fe + 2 HCl -> FeCl2 + H2', '4 Al + 3 O2 -> 2 Al2O3',
     '3 Fe + 2 O2 -> Fe3O4', '2 NaOH + H2SO4 -> Na2SO4 + 2 H2O', '2 CO2 -> 2 CO + O2'],
    ['2 C2H6 + 7 O2 -> 4 CO2 + 6 H2O', '4 NH3 + 5 O2 -> 4 NO + 6 H2O', '4 NH3 + 3 O2 -> 2 N2 + 6 H2O',
     'C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O', 'Fe2O3 + 3 CO -> 2 Fe + 3 CO2', 'C2H4 + 3 O2 -> 2 CO2 + 2 H2O',
     '2 C2H2 + 5 O2 -> 4 CO2 + 2 H2O', '4 HCl + O2 -> 2 Cl2 + 2 H2O',
     '2 Al + 6 HCl -> 2 AlCl3 + 3 H2', '2 FeCl3 + 3 H2 -> 2 Fe + 6 HCl',
     '2 Na + 2 H2O -> 2 NaOH + H2', 'CaCO3 -> CaO + CO2', '2 H2SO4 -> 2 SO2 + O2 + 2 H2O'],
];

// [nome em português, nome em inglês usado para buscar no PubChem]
const NOMES = {
    H2: ['gás hidrogênio', 'hydrogen'], O2: ['gás oxigênio', 'oxygen'], N2: ['gás nitrogênio', 'nitrogen'],
    Cl2: ['gás cloro', 'chlorine'], H2O: ['água', 'water'], NH3: ['amônia', 'ammonia'], CH4: ['metano', 'methane'],
    CO2: ['gás carbônico', 'carbon dioxide'], HCl: ['ácido clorídrico', 'hydrogen chloride'], Na: ['sódio', 'sodium'],
    NaCl: ['sal de cozinha', 'sodium chloride'], H2O2: ['água oxigenada', 'hydrogen peroxide'], C: ['carbono', 'carbon'],
    Mg: ['magnésio', 'magnesium'], MgO: ['óxido de magnésio', 'magnesium oxide'], CO: ['monóxido de carbono', 'carbon monoxide'],
    SO2: ['dióxido de enxofre', 'sulfur dioxide'], SO3: ['trióxido de enxofre', 'sulfur trioxide'], C2H6: ['etano', 'ethane'],
    C3H8: ['propano', 'propane'], Fe: ['ferro', 'iron'], Fe2O3: ['ferrugem', 'ferric oxide'],
    KClO3: ['clorato de potássio', 'potassium chlorate'], KCl: ['cloreto de potássio', 'potassium chloride'],
    C2H5OH: ['etanol', 'ethanol'], NO: ['monóxido de nitrogênio', 'nitric oxide'], C6H12O6: ['glicose', 'glucose'],
    Al: ['alumínio', 'aluminum'], AlCl3: ['cloreto de alumínio', 'aluminum chloride'], C2H4: ['eteno', 'ethylene'],
    C2H2: ['acetileno', 'acetylene'], K: ['potássio', 'potassium'], Ca: ['cálcio', 'calcium'],
    CaCO3: ['carbonato de cálcio', 'calcium carbonate'], CaO: ['óxido de cálcio', 'calcium oxide'],
    NaHCO3: ['bicarbonato de sódio', 'sodium bicarbonate'], Na2CO3: ['carbonato de sódio', 'sodium carbonate'],
    MgCl2: ['cloreto de magnésio', 'magnesium chloride'], FeCl2: ['cloreto de ferro II', 'iron dichloride'],
    Al2O3: ['óxido de alumínio', 'aluminum oxide'], Fe3O4: ['óxido de ferro II e III', 'iron tetroxide'],
    NaOH: ['hidróxido de sódio', 'sodium hydroxide'], H2SO4: ['ácido sulfúrico', 'sulfuric acid'],
    Na2SO4: ['sulfato de sódio', 'sodium sulfate'], FeCl3: ['cloreto de ferro III', 'iron trichloride'],
};

// Cores CPK (mesmas do visualizador 3D do TCC)
const CORES = {
    C: 0x909090, H: 0xffffff, O: 0xff0d0d, N: 0x3050f8, S: 0xffcc33, Cl: 0x1ff01f,
    Na: 0xab5cf2, Mg: 0x8dff66, Fe: 0xcc6600, K: 0x8f40d4, Al: 0xbfa6a6, Ca: 0x3dff00,
};
const corCss = el => '#' + (CORES[el] ?? 0xffaa77).toString(16).padStart(6, '0');
const MAX_COEF = 10;

// ===== QUÍMICA =====
const parseEquacao = s => s.split('->').map(lado => lado.split('+').map(t => {
    const [, n, f] = t.trim().match(/^(\d*)\s*(\S+)$/);
    return { f, resposta: +(n || 1) };
}));

// ponytail: não trata parênteses tipo Ca(OH)2; escreva a fórmula "aberta" (CaO2H2) se precisar
function contarAtomos(formula) {
    const c = {};
    for (const [, el, n] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) c[el] = (c[el] || 0) + (+n || 1);
    return c;
}

function totalLado(lado, coefs) {
    const t = {};
    lado.forEach((m, i) => {
        for (const [el, n] of Object.entries(contarAtomos(m.f))) t[el] = (t[el] || 0) + n * coefs[i];
    });
    return t;
}

const mdc = (a, b) => b ? mdc(b, a % b) : a;

// 'zero' | 'desbalanceada' | 'nao-simplificada' | 'ok'
function avaliar([esq, dir], cEsq, cDir) {
    const todos = [...cEsq, ...cDir];
    if (todos.some(c => c === 0)) return 'zero';
    const a = totalLado(esq, cEsq), b = totalLado(dir, cDir);
    if (Object.keys({ ...a, ...b }).some(el => a[el] !== b[el])) return 'desbalanceada';
    return todos.reduce(mdc) === 1 ? 'ok' : 'nao-simplificada';
}

// Autoteste (aparece no console se algo quebrar)
{
    const eq = parseEquacao('CH4 + 2 O2 -> CO2 + 2 H2O');
    console.assert(avaliar(eq, [1, 2], [1, 2]) === 'ok', 'metano ok');
    console.assert(avaliar(eq, [2, 4], [2, 4]) === 'nao-simplificada', 'metano dobrado');
    console.assert(avaliar(eq, [1, 1], [1, 1]) === 'desbalanceada', 'metano errado');
    console.assert(contarAtomos('C2H5OH').H === 6, 'etanol H');
    for (const s of [...NIVEIS.flat(), TUTORIAL_EQ]) {
        const e = parseEquacao(s);
        console.assert(avaliar(e, ...e.map(l => l.map(m => m.resposta))) === 'ok', s);
        console.assert(e.flat().every(m => NOMES[m.f] && m.resposta <= MAX_COEF), 'nome/coef ' + s);
    }
}

// ===== PUBCHEM -> MODELO 3D =====
const esfera = new THREE.SphereGeometry(1, 32, 24);
const barraLigacao = new THREE.CylinderGeometry(.06, .06, 1, 12);
const materiais = {};
const material = el => materiais[el] ??= new THREE.MeshPhongMaterial({ color: CORES[el] ?? 0xffaa77, shininess: 90, specular: 0x444444 });
const materialLigacao = new THREE.MeshPhongMaterial({ color: 0xd1d5db, shininess: 70, specular: 0x555555 });
const EN = { H: 2.2, C: 2.55, S: 2.58, N: 3.04, Cl: 3.16, O: 3.44 }; // metais ficam com ~1
const VALENCIA = { H: 1, C: 4, N: 5, O: 6, S: 6, Cl: 7, Na: 1, K: 1, Mg: 2, Ca: 2, Al: 3, Fe: 3 };
const t = 1 / Math.sqrt(3);
const DIRECOES = { // linear, trigonal plana, tetraédrica (primeiras posições usadas pelos ligantes)
    1: [[1, 0, 0]], 2: [[1, 0, 0], [-1, 0, 0]],
    3: [[1, 0, 0], [-.5, .866, 0], [-.5, -.866, 0]],
    4: [[t, t, t], [-t, -t, t], [-t, t, -t], [t, -t, -t]],
};
const assinatura =c => JSON.stringify(Object.entries(c).sort());

// Usa as coordenadas do PubChem; se faltar (sem internet / sem registro) monta um aglomerado simples.
function geometria(f, dados) {
    if (dados?.atomos && assinatura(contarAtomos(dados.atomos.map(a => a[0]).join(''))) === assinatura(contarAtomos(f))) {
        return { atomos: dados.atomos, ligacoes: dados.ligacoes || [] };
    }
    const cont = contarAtomos(f);
    const els = Object.entries(cont).flatMap(([el, n]) => Array(n).fill(el));
    // Átomo central = elemento (não H) que aparece uma vez, o menos eletronegativo (C em CO2, O em H2O)
    const centro = Object.keys(cont).filter(el => el !== 'H' && cont[el] === 1).sort((a, b) => (EN[a] ?? 1) - (EN[b] ?? 1))[0];
    if (els.length > 2 && centro) {
        const ligantes = els.filter((_, i) => i !== els.indexOf(centro));
        const ordens = ligantes.map(el => el === 'O' && centro !== 'H' ? 2 : 1);
        // VSEPR: pares isolados = elétrons de valência que sobram / 2 (H2O tem 2 -> angular; CO2 tem 0 -> linear)
        const pares = Math.max(0, Math.floor(((VALENCIA[centro] ?? 2) - ordens.reduce((s, o) => s + o, 0)) / 2));
        const dirs = DIRECOES[Math.min(4, ligantes.length + pares)] ?? DIRECOES[4];
        if (ligantes.length <= dirs.length) return {
            atomos: [[centro, 0, 0, 0], ...ligantes.map((el, i) => [el, ...dirs[i]])],
            ligacoes: ligantes.map((_, i) => [0, i + 1, ordens[i]]),
        };
    }
    // shortcut: sem átomo central único (Fe2O3, H2O2...) vira um anel sem ligações; essas vêm do PubChem quando há internet
    return { atomos: els.map((el, i) => i ? [el, Math.cos(2 * Math.PI * i / (els.length - 1)), Math.sin(2 * Math.PI * i / (els.length - 1)), 0] : [el, 0, 0, 0]), ligacoes: [] };
}

// Modelo "space-filling" (esferas encostadas, como no PhET), normalizado para caber num diâmetro 1
function criarModelo({ atomos, ligacoes }) {
    const c = [1, 2, 3].map(k => atomos.reduce((s, a) => s + a[k], 0) / atomos.length);
    let d = Infinity;
    for (let i = 0; i < atomos.length; i++) for (let j = i + 1; j < atomos.length; j++) {
        const dist = Math.hypot(...[1, 2, 3].map(k => atomos[i][k] - atomos[j][k]));
        if (dist > .01) d = Math.min(d, dist);
    }
    if (!isFinite(d)) d = 1;
    const interno = new THREE.Group();
    const pontos = atomos.map(([, ...p]) => new THREE.Vector3(...p.map((v, k) => (v - c[k]) / d)));
    const eixoY = new THREE.Vector3(0, 1, 0);
    for (const [a, b, ordem] of ligacoes) {
        if (!pontos[a] || !pontos[b]) continue;
        const inicio = pontos[a], fim = pontos[b];
        const direcao = new THREE.Vector3().subVectors(fim, inicio);
        const comprimento = direcao.length();
        if (comprimento < .01) continue;
        direcao.normalize();
        const referencia = Math.abs(direcao.y) < .9 ? eixoY : new THREE.Vector3(1, 0, 0);
        const perpendicular = new THREE.Vector3().crossVectors(direcao, referencia).normalize();
        const quantidade = Math.max(1, Math.min(3, Math.round(ordem)));
        for (let n = 0; n < quantidade; n++) {
            const barra = new THREE.Mesh(barraLigacao, materialLigacao);
            barra.position.copy(inicio).add(fim).multiplyScalar(.5).addScaledVector(perpendicular, (n - (quantidade - 1) / 2) * .14);
            barra.quaternion.setFromUnitVectors(eixoY, direcao);
            barra.scale.y = comprimento;
            interno.add(barra);
        }
    }
    let R = 1.3; // átomo isolado não fica gigante
    for (const [el, ...p] of atomos) {
        const m = new THREE.Mesh(esfera, material(el));
        m.position.set(...p.map((v, k) => (v - c[k]) / d));
        const r = el === 'H' ? .22 : .32; // bola e vareta: esferas menores para as ligações aparecerem
        m.scale.setScalar(r);
        interno.add(m);
        R = Math.max(R, m.position.length() + r);
    }
    interno.scale.setScalar(.5 / R);
    const g = new THREE.Group();
    g.add(interno);
    return g;
}

const cachePubchem = {}, cacheModelo = {};
const SIMBOLOS = 'X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe'.split(' ');
// Busca direto no PubChem (aceita CORS), então funciona mesmo sem o server.py. 3D quando existe; sais só têm 2D.
async function pubchemDireto(nome) {
    for (const tipo of ['3d', '2d']) {
        const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(nome)}/JSON?record_type=${tipo}`);
        if (!r.ok) continue;
        const c = (await r.json()).PC_Compounds[0];
        const { x, y, z = x.map(() => 0) } = c.coords[0].conformers[0];
        const b = c.bonds ?? { aid1: [], aid2: [], order: [] };
        return {
            atomos: c.atoms.element.map((e, i) => [SIMBOLOS[e] ?? '?', x[i], y[i], z[i]]),
            ligacoes: b.aid1.map((a, i) => [a - 1, b.aid2[i] - 1, b.order[i]]), // PubChem conta a partir de 1
        };
    }
    return null;
}
// Compostos iônicos: o PubChem devolve os íons soltos (Al2O3 vira 5 bolinhas sem ligação) ou nem tem (Fe3O4).
// Aqui vai a estrutura de livro didático: [elemento, x, y, z] e [átomo a, átomo b, ordem da ligação].
const cadeiaMO = (M, n) => { // O=M-O-M-...-M=O em zigue-zague (Al2O3, Fe2O3, Fe3O4)
    const atomos = [], ligacoes = [];
    for (let i = 0; i <= 2 * n; i++) {
        atomos.push(i % 2 ? [M, (i - n) * 1.3, 0, 0] : ['O', (i - n) * 1.3, .8, 0]);
        if (i) ligacoes.push([i - 1, i, i === 1 || i === 2 * n ? 2 : 1]);
    }
    return { atomos, ligacoes };
};
const CARBONATO = [['C', 0, 0, 0], ['O', 0, 1.25, 0], ['O', -1.08, -.62, 0], ['O', 1.08, -.62, 0]];
const LIG_CARBONATO = [[0, 1, 2], [0, 2, 1], [0, 3, 1]];
const TETRA = [[.84, .84, .84], [-.84, -.84, .84], [-.84, .84, -.84], [.84, -.84, -.84]];
const ESTRUTURAS = {
    Al2O3: cadeiaMO('Al', 2), Fe2O3: cadeiaMO('Fe', 2), Fe3O4: cadeiaMO('Fe', 3),
    MgCl2: { atomos: [['Cl', -1.5, 0, 0], ['Mg', 0, 0, 0], ['Cl', 1.5, 0, 0]], ligacoes: [[0, 1, 1], [1, 2, 1]] },
    CaCO3: { atomos: [...CARBONATO, ['Ca', 0, -1.9, 0]], ligacoes: [...LIG_CARBONATO, [4, 2, 1], [4, 3, 1]] },
    Na2CO3: { atomos: [...CARBONATO, ['Na', -2.2, -1.25, 0], ['Na', 2.2, -1.25, 0]], ligacoes: [...LIG_CARBONATO, [4, 2, 1], [5, 3, 1]] },
    NaHCO3: { atomos: [...CARBONATO, ['H', -1.9, -.1, 0], ['Na', 2.2, -1.25, 0]], ligacoes: [...LIG_CARBONATO, [4, 2, 1], [5, 3, 1]] },
    Na2SO4: { atomos: [['S', 0, 0, 0], ...TETRA.map(p => ['O', ...p]), ['Na', -1.65, 1.65, -1.65], ['Na', 1.65, -1.65, -1.65]],
        ligacoes: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [0, 4, 1], [5, 3, 1], [6, 4, 1]] },
    KClO3: { atomos: [['Cl', 0, 0, 0], ...TETRA.slice(0, 3).map(p => ['O', ...p]), ['K', -1.75, 1.75, -1.75]],
        ligacoes: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [4, 3, 1]] },
};
const buscarPubchem = f => cachePubchem[f] ??= ESTRUTURAS[f] ? Promise.resolve(ESTRUTURAS[f]) : pubchemDireto(NOMES[f]?.[1] || f).catch(() => null);
const modeloDe = f => cacheModelo[f] ??= buscarPubchem(f).then(d => criarModelo(geometria(f, d)));

// ===== CAIXAS 3D =====
// Elemento que segue o dedo/mouse enquanto arrasta uma molécula
const fantasma = document.createElement('div');
document.body.append(fantasma);
function moverFantasma(html, e, cor = 'from-purple-600 to-blue-600') {
    fantasma.className = `fixed z-[70] pointer-events-none px-3 py-2 rounded-xl text-white text-lg font-bold shadow-2xl -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r ${cor} ${html ? '' : 'hidden'}`;
    if (!html) return;
    fantasma.innerHTML = html;
    atualizarIcones();
    fantasma.style.left = e.clientX + 'px';
    fantasma.style.top = e.clientY + 'px';
}

function criarCaixa(div, lado) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(devicePixelRatio);
    div.appendChild(renderer.domElement);
    const cena = new THREE.Scene();
    cena.add(new THREE.HemisphereLight(0xffffff, 0x222244, 1.6));
    const luz = new THREE.DirectionalLight(0xffffff, 2.2);
    luz.position.set(2, 4, 6);
    cena.add(luz);
    const cam = new THREE.OrthographicCamera();
    cam.position.z = 10;
    const grupo = new THREE.Group();
    cena.add(grupo);
    let colunas = [], inclinacao = .4;

    const caixa = {
        // colunas: [{ modelo, n, f }] -> uma coluna por substância, n moléculas empilhadas
        definir(novas) {
            const antes = colunas;
            colunas = novas;
            grupo.clear();
            const w = div.clientWidth, h = div.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            const H = 6, W = H * w / h, larg = W / Math.max(novas.length, 1);
            Object.assign(cam, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 });
            cam.updateProjectionMatrix();
            // poucas moléculas -> desenha maiores (entre 3 e 5 "andares" de altura)
            const andares = Math.min(5, Math.max(3, ...novas.map(c => c.n)));
            novas.forEach(({ modelo, n, f }, i) => {
                const pilhas = n > 5 ? 2 : 1, cel = Math.min(larg / pilhas, (H - .6) / andares) * .95;
                for (let k = 0; k < n; k++) {
                    const m = modelo.clone();
                    m.position.set(-W / 2 + larg * (i + .5) + (pilhas > 1 ? (Math.floor(k / 5) - .5) * cel : 0), -H / 2 + .2 + cel * (k % 5 + .5), 0);
                    m.rotation.set(inclinacao, k * 1.3, 0);
                    const nova = antes[i]?.modelo !== modelo || k >= antes[i].n;
                    m.userData = { alvo: cel, f, i };
                    m.scale.setScalar(nova ? .01 : cel); // moléculas novas "surgem" crescendo
                    grupo.add(m);
                }
            });
        },
        render(dt) {
            for (const m of grupo.children) {
                if (!arraste) m.rotation.y += dt * .8;
                const alvo = m.userData.alvo * (m === arraste?.m && arraste.moveu ? 1.25 : m === destaque ? 1.15 : 1);
                m.scale.setScalar(m.scale.x + (alvo - m.scale.x) * Math.min(1, dt * 10));
            }
            renderer.render(cena, cam);
        },
    };
    new ResizeObserver(() => caixa.definir(colunas)).observe(div);

    // ----- interação: passar o mouse / tocar, arrastar para fora, girar -----
    const cv = renderer.domElement;
    cv.style.touchAction = 'none';
    const dica = document.createElement('div');
    dica.className = 'absolute z-10 pointer-events-none hidden px-2 py-1 rounded-lg bg-white/95 text-xs font-semibold text-gray-800 shadow-lg whitespace-nowrap';
    div.append(dica);
    const ray = new THREE.Raycaster();
    let arraste = null, destaque = null, timerDica;

    const local = e => {
        const r = div.getBoundingClientRect();
        return { px: e.clientX - r.left, py: e.clientY - r.top, fora: e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom };
    };
    function acertar(px, py) {
        ray.setFromCamera(new THREE.Vector2(px / div.clientWidth * 2 - 1, 1 - py / div.clientHeight * 2), cam);
        let o = ray.intersectObjects(grupo.children, true)[0]?.object;
        while (o && o.parent !== grupo) o = o.parent;
        return o || null;
    }
    function mostrarDica(m, px, py) {
        destaque = m;
        clearTimeout(timerDica);
        dica.classList.toggle('hidden', !m);
        if (!m) return;
        const f = m.userData.f;
        dica.innerHTML = `${sub(f)} · ${NOMES[f][0]} <span class="text-gray-500 font-normal">(${Object.entries(contarAtomos(f)).map(([el, n]) => `${n} ${el}`).join(' + ')})</span>`;
        dica.style.left = Math.max(4, Math.min(px + 12, div.clientWidth - dica.offsetWidth - 4)) + 'px';
        dica.style.top = Math.max(4, py - 36) + 'px';
    }

    cv.addEventListener('pointerdown', e => {
        const { px, py } = local(e), m = acertar(px, py);
        cv.setPointerCapture(e.pointerId);
        arraste = { m, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moveu: false };
        mostrarDica(m, px, py);
        cv.style.cursor = 'grabbing';
    });
    cv.addEventListener('pointermove', e => {
        const { px, py, fora } = local(e);
        if (!arraste) {
            const m = acertar(px, py);
            mostrarDica(m, px, py);
            cv.style.cursor = m ? 'grab' : 'move';
            return;
        }
        if (Math.hypot(e.clientX - arraste.x0, e.clientY - arraste.y0) > 6) arraste.moveu = true;
        if (!arraste.moveu) return;
        mostrarDica(null);
        if (arraste.m && !travado()) {
            // arrastando uma molécula: segue o ponteiro; fora da caixa vira "remover"
            arraste.m.position.set(cam.left + px / div.clientWidth * (cam.right - cam.left), cam.top - py / div.clientHeight * (cam.top - cam.bottom), 3);
            moverFantasma(fora ? `${icone('trash-2', 'w-5 h-5')} − ${sub(arraste.m.userData.f)}` : null, e, 'from-red-500 to-pink-500');
        } else {
            // arrastando o fundo: gira todas as moléculas
            const dx = e.clientX - arraste.x, dy = e.clientY - arraste.y;
            inclinacao += dy * .01;
            for (const m of grupo.children) { m.rotation.y += dx * .01; m.rotation.x += dy * .01; }
        }
        arraste.x = e.clientX;
        arraste.y = e.clientY;
    });
    const soltar = e => {
        const a = arraste;
        arraste = null;
        cv.style.cursor = '';
        moverFantasma(null);
        if (!a) return;
        if (a.m && a.moveu && !travado()) {
            if (e.type === 'pointerup' && local(e).fora) mudarCoef(lado, a.m.userData.i, -1);
            else caixa.definir(colunas); // volta para o lugar
        }
        if (e.pointerType !== 'mouse') timerDica = setTimeout(() => mostrarDica(null), 1800); // no toque a dica some sozinha
    };
    cv.addEventListener('pointerup', soltar);
    cv.addEventListener('pointercancel', soltar);
    cv.addEventListener('pointerleave', () => { if (!arraste) mostrarDica(null); });
    return caixa;
}

const $ = id => document.getElementById(id);
const icone = (nome, classe = 'w-5 h-5') => `<i data-lucide="${nome}" class="${classe}" aria-hidden="true"></i>`;
const atualizarIcones = () => window.lucide?.createIcons();
const caixas = [criarCaixa($('caixa0'), 0), criarCaixa($('caixa1'), 1)];
let t0 = performance.now();
requestAnimationFrame(function loop(t) {
    const dt = Math.min(.05, (t - t0) / 1000);
    t0 = t;
    if (!$('bancada').hidden) caixas.forEach(c => c.render(dt));
    requestAnimationFrame(loop);
});

// ===== ESTADO =====
const estado = { modo: 'tutorial', passo: 0, eq: null, coefs: [[], []], modelos: null, jogo: null, feliz: null };
const sub = f => f.replace(/(\d+)/g, '<sub>$1</sub>');
const BTN = 'btn-3d bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-base font-semibold';
const BTN2 = 'btn-3d-cinza bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold';
const SETA = `<svg viewBox="0 0 100 60" class="w-12 md:w-20 drop-shadow-lg"><defs><linearGradient id="gs"><stop offset="0" stop-color="#9333ea"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><path d="M5 20h55V5l35 25-35 25V40H5z" fill="url(#gs)"/></svg>`;
const SORRISO = `<div class="pop w-12 h-12 md:w-20 md:h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50">${icone('smile', 'w-7 h-7 md:w-11 md:h-11 text-white')}</div>`;
const travado = () => estado.modo === 'jogo' && estado.jogo?.fase !== 'jogando';

async function carregarEquacao(s, coefInicial) {
    const eq = parseEquacao(s);
    Object.assign(estado, { eq, coefs: eq.map(l => l.map(() => coefInicial)), modelos: null, feliz: null });
    desenharEquacao();
    caixas.forEach(c => c.definir([]));
    document.querySelectorAll('.caixa').forEach(c => c.classList.add('loading'));
    atualizar();
    const modelos = await Promise.all(eq.map(lado => Promise.all(lado.map(m => modeloDe(m.f)))));
    if (estado.eq !== eq) return; // trocou de equação enquanto carregava
    estado.modelos = modelos;
    document.querySelectorAll('.caixa').forEach(c => c.classList.remove('loading'));
    atualizar();
}

function desenharEquacao() {
    estado.eq.forEach((lado, l) => {
        $('lado' + l).innerHTML = lado.map((m, i) => `
            <div class="relative flex-1 flex items-center justify-center gap-1 md:gap-2 py-1">
                ${i ? '<span class="absolute left-0 -translate-x-1/2 text-2xl md:text-3xl font-bold text-gray-400">+</span>' : ''}
                <div class="flex flex-col items-center">
                    <button aria-label="Aumentar coeficiente" data-acao="coef" data-arg="${l},${i},1" class="ctrl w-9 h-6 rounded-t-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs disabled:opacity-30 flex items-center justify-center">${icone('chevron-up', 'w-4 h-4')}</button>
                    <input data-l="${l}" data-i="${i}" inputmode="numeric" maxlength="2"
                        class="ctrl coef w-9 md:w-11 h-9 md:h-11 text-center text-xl md:text-2xl font-bold text-purple-700 bg-white border-2 border-purple-200 focus:border-purple-500 outline-none">
                    <button aria-label="Diminuir coeficiente" data-acao="coef" data-arg="${l},${i},-1" class="ctrl w-9 h-6 rounded-b-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs disabled:opacity-30 flex items-center justify-center">${icone('chevron-down', 'w-4 h-4')}</button>
                </div>
                <div data-l="${l}" data-i="${i}" title="Arraste para a caixa para adicionar"
                    class="arrastavel leading-tight px-2 py-1 rounded-xl border-2 border-dashed border-transparent hover:border-purple-300 hover:bg-purple-50 cursor-grab touch-none select-none transition">
                    <div class="text-lg md:text-3xl font-bold">${sub(m.f)}</div>
                    <div class="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">${NOMES[m.f][0]} ${icone('hand', 'w-3.5 h-3.5 text-purple-400')}</div>
                </div>
            </div>`).join('');
    });
    atualizarIcones();
}

function atualizar() {
    const { eq, coefs } = estado;
    document.querySelectorAll('.coef').forEach(inp => inp.value = coefs[inp.dataset.l][inp.dataset.i]);
    document.querySelectorAll('.ctrl').forEach(b => b.disabled = travado());
    if (estado.modelos) caixas.forEach((c, l) => c.definir(eq[l].map((m, i) => ({ modelo: estado.modelos[l][i], n: coefs[l][i], f: m.f }))));

    const r = avaliar(eq, ...coefs);
    const tutorial = estado.modo === 'tutorial';
    const feliz = tutorial ? r === 'ok' || r === 'nao-simplificada' : estado.jogo.fase === 'certo';
    if (feliz !== estado.feliz) {
        $('seta').innerHTML = (estado.feliz = feliz) ? SORRISO : SETA;
        atualizarIcones();
    }

    // No jogo a contagem só aparece depois de verificar (senão entrega a resposta)
    const mostrar = tutorial || travado();
    $('contagemBox').hidden = !mostrar;
    if (mostrar) desenharContagem();

    if (!tutorial) return;
    mensagem(...{
        zero: ['Coloque pelo menos <b>1 molécula</b> de cada substância nas caixas.', 'cinza'],
        desbalanceada: [`Quase lá! ${diferencas()}`, 'cinza'],
        'nao-simplificada': ['Balanceada! Mas dá para <b>dividir todos os números</b> e usar menores.', 'verde'],
        ok: ['<b>Balanceada!</b> Os mesmos átomos dos dois lados: nada foi criado nem destruído (Lavoisier).', 'verde'],
    }[r]);
    // passo do tutorial que espera uma ação: avança sozinho quando o aluno faz
    const passo = estado.passo;
    if (PASSOS[passo].pronto?.(estado.coefs, r)) setTimeout(() => estado.modo === 'tutorial' && estado.passo === passo && mostrarPasso(passo + 1), 900);
}

function desenharContagem() {
    const [esq, dir] = estado.eq;
    const a = totalLado(esq, estado.coefs[0]), b = totalLado(dir, estado.coefs[1]);
    const max = Math.max(1, ...Object.values(a), ...Object.values(b));
    const barra = (v, cor) => `
        <div class="flex flex-col items-center justify-end h-16 md:h-20 w-6">
            <span class="text-xs font-bold">${v}</span>
            <div class="barra w-full rounded-t-md bg-gradient-to-t ${cor}" style="height:${(v / max) * 75}%"></div>
        </div>`;
    $('contagem').innerHTML = Object.keys({ ...a, ...b }).map(el => {
        const ok = a[el] === b[el];
        return `<div class="shrink-0 flex flex-col items-center px-2 py-1 rounded-xl border ${ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
            <div class="flex items-end gap-1">${barra(a[el] || 0, 'from-purple-600 to-purple-400')}${barra(b[el] || 0, 'from-blue-600 to-blue-400')}</div>
            <div class="mt-1 text-sm font-bold flex items-center gap-1">
                <span class="w-4 h-4 rounded-full" style="background:radial-gradient(circle at 35% 30%, #fff, ${corCss(el)} 45%, #000 130%)"></span>
                ${el} <span class="${ok ? 'text-green-600' : 'text-red-500'}">${icone(ok ? 'check' : 'x', 'w-4 h-4')}</span>
            </div>
        </div>`;
    }).join('');
    atualizarIcones();
}

// Ex.: "O: 4 nos reagentes e 2 nos produtos." -> diz ao aluno exatamente onde mexer
function diferencas() {
    const [esq, dir] = estado.eq;
    const a = totalLado(esq, estado.coefs[0]), b = totalLado(dir, estado.coefs[1]);
    const erros = Object.keys({ ...a, ...b }).filter(el => a[el] !== b[el]).map(el => `<b>${el}</b>: ${a[el] || 0} nos reagentes e ${b[el] || 0} nos produtos`);
    return erros.length ? erros.join('; ') + '.' : '';
}

function mensagem(iconeMensagem, texto, cor, botoes = '') {
    const estilo = { cinza: 'bg-gray-100 text-gray-700', verde: 'bg-green-50 text-green-700 border border-green-200', vermelho: 'bg-red-50 text-red-700 border border-red-200' }[cor];
    $('acoes').innerHTML = `<div class="flex flex-wrap items-center justify-center gap-3 p-3 rounded-xl ${estilo}">
        <span class="shrink-0">${icone(iconeMensagem, 'w-6 h-6')}</span><span class="font-semibold text-sm md:text-base">${texto}</span>${botoes}</div>`;
    atualizarIcones();
}

// ===== FLUXO: tutorial -> níveis -> jogo -> fim =====
function mostrarBancada(sim) {
    $('bancada').hidden = !sim;
    $('telaNivel').hidden = sim;
}

function abrirTutorial() {
    Object.assign(estado, { modo: 'tutorial', jogo: null });
    mostrarBancada(true);
    $('veu').hidden = $('falas').hidden = false;
    $('barraTopo').innerHTML = `<span class="font-game px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm inline-flex items-center gap-2">${icone('book-open', 'w-4 h-4')}Tutorial</span>`;
    atualizarIcones();
    carregarEquacao(TUTORIAL_EQ, 1);
    mostrarPasso(0);
}

function mostrarPasso(n) {
    if (n >= PASSOS.length) return telaNiveis();
    estado.passo = n;
    const p = PASSOS[n], ultimo = n === PASSOS.length - 1;
    // caixa de fala estilo RPG: personagem + balão
    $('falas').innerHTML = `
        <div class="pop max-w-3xl mx-auto flex items-end gap-3 md:gap-4">
            <img src="arly.png" alt="Arly, a mascote" class="flutuar shrink-0 w-24 h-24 md:w-40 md:h-40 object-contain drop-shadow-[0_8px_20px_rgba(147,51,234,.6)] select-none pointer-events-none">
            <div class="relative flex-1 bg-white rounded-2xl shadow-2xl border-4 border-purple-500 p-4 md:p-5">
                <span class="font-game absolute -top-3.5 left-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs md:text-sm tracking-wide">ARLY</span>
                <span class="absolute -left-4 bottom-6 border-y-[10px] border-y-transparent border-r-[14px] border-r-purple-500"></span>
                <h3 class="text-xl md:text-2xl font-bold text-purple-700 mt-1">${p.titulo}</h3>
                <p class="revelar text-sm md:text-base text-gray-700 mt-1">${p.texto}</p>
                <div class="flex flex-wrap items-center gap-3 mt-4">
                    <div class="flex gap-1.5">${PASSOS.map((_, k) => `<span class="h-2.5 rounded-full transition-all ${k === n ? 'w-7 bg-purple-600' : k < n ? 'w-2.5 bg-purple-300' : 'w-2.5 bg-gray-300'}"></span>`).join('')}</div>
                    <button data-acao="pular" class="ml-auto text-sm text-gray-400 hover:text-gray-600 hover:underline inline-flex items-center gap-1">Pular tutorial ${icone('forward', 'w-4 h-4')}</button>
                    ${p.pronto
                        ? `<span class="font-game text-base text-purple-600 loading inline-flex items-center gap-2">${icone('hand-pointer', 'w-5 h-5')}Faça isso para continuar</span>`
                        : `<button data-acao="passo" class="${BTN} inline-flex items-center gap-2">${ultimo ? `${icone('target', 'w-5 h-5')}Bora jogar!` : `Próximo ${icone('chevron-right', 'w-5 h-5')}`}</button>`}
                </div>
            </div>
        </div>`;
    if (p.confete) confete();
    atualizarIcones();
    document.querySelectorAll('.foco').forEach(el => el.classList.remove('foco'));
    if (p.foco) document.querySelectorAll(p.foco).forEach((el, k) => {
        el.classList.add('foco');
        if (!k) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    if (estado.eq) atualizar(); // se o aluno já fez a ação, avança direto
}

// Moléculas "3D" em CSS para os cartões de nível (HCl, H2O, NH3 como no PhET)
const bola = (x, y, d, cor) => `<span class="bola" style="left:${x}px;top:${y}px;width:${d}px;height:${d}px;background:radial-gradient(circle at 35% 30%, #fff, ${cor} 45%, #000 140%)"></span>`;
const ICONES = [
    bola(34, 8, 54, '#1ff01f') + bola(14, 26, 30, '#ddd'),
    bola(26, 10, 44, '#ff0d0d') + bola(10, 32, 30, '#ddd') + bola(54, 32, 30, '#ddd'),
    bola(26, 4, 46, '#3050f8') + bola(10, 28, 30, '#ddd') + bola(52, 28, 30, '#ddd') + bola(31, 38, 30, '#ddd'),
];
const estrelas = n => '<span class="text-yellow-400">★</span>'.repeat(n) + '<span class="text-gray-300">★</span>'.repeat(5 - n);
const recorde = n => { try { return +localStorage.getItem('bal-recorde' + n) || 0; } catch { return 0; } };

function telaNiveis() {
    Object.assign(estado, { modo: 'jogo', jogo: null, eq: null });
    $('veu').hidden = $('falas').hidden = true;
    document.querySelectorAll('.foco').forEach(el => el.classList.remove('foco'));
    mostrarBancada(false);
    $('telaNivel').innerHTML = `
        <h2 class="text-xl md:text-3xl font-bold mb-1">Escolha seu nível</h2>
        <p class="text-xs md:text-sm text-gray-500 mb-4 md:mb-8">5 equações por partida • acertou de primeira = 2 pontos, na segunda = 1 ponto</p>
        <div class="grid grid-cols-3 gap-2 md:gap-5 max-w-3xl w-full mx-auto">
            ${['Fácil', 'Médio', 'Difícil'].map((nome, i) => `
            <button data-acao="nivel" data-arg="${i}" class="cartao-nivel group p-2 md:p-5 rounded-2xl bg-gradient-to-b from-purple-50 to-blue-50 border-2 border-purple-200 hover:border-purple-500 hover:-translate-y-1 transition">
                <div class="font-bold text-base md:text-lg">Nível ${i + 1}</div>
                <div class="text-xs text-gray-500 mb-1 md:mb-3">${nome}</div>
                <div class="relative w-24 h-20 mx-auto mb-2 md:mb-3 scale-75 md:scale-100 group-hover:scale-110 transition">${ICONES[i]}</div>
            </button>`).join('')}
        </div>`;
    atualizarIcones();
}

function iniciarJogo(nivel) {
    const fila = [...NIVEIS[nivel]].sort(() => Math.random() - .5).slice(0, 5);
    estado.jogo = { nivel, fila, idx: 0, pontos: 0, tentativas: 0, inicio: Date.now(), fase: 'jogando' };
    mostrarBancada(true);
    proximaEquacao();
}

function proximaEquacao() {
    const j = estado.jogo;
    if (j.idx >= j.fila.length) return fimDeJogo();
    Object.assign(j, { tentativas: 0, usouDica: false, fase: 'jogando' });
    barraJogo();
    carregarEquacao(j.fila[j.idx], 0);
    pedirVerificacao('Deixe o <b>mesmo número de cada átomo</b> dos dois lados e clique em Verificar.');
}

const BOTAO_DICA = () => `<button data-acao="dica" class="${BTN2} inline-flex items-center gap-2">${icone('lightbulb', 'w-4 h-4')}Dica</button>`;
const pedirVerificacao = (texto, cor = 'cinza', iconeMsg = 'flask-conical') => mensagem(iconeMsg, texto, cor, `<button data-acao="verificar" class="${BTN} inline-flex items-center gap-2">${icone('check', 'w-5 h-5')}Verificar</button>${BOTAO_DICA()}`);
const relogio = () => { const s = Math.floor((Date.now() - estado.jogo.inicio) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
setInterval(() => { if (estado.jogo && $('tempo')) $('tempo').textContent = relogio(); }, 1000);

function barraJogo() {
    const j = estado.jogo;
    $('barraTopo').innerHTML = `
        <span class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold">Nível ${j.nivel + 1}</span>
        <span class="px-3 py-1.5 rounded-xl bg-gray-100 text-sm">Equação <b>${j.idx + 1}</b>/5</span>
        <span class="px-3 py-1.5 rounded-xl bg-gray-100 text-sm inline-flex items-center gap-1">${icone('trophy', 'w-4 h-4 text-yellow-600')}<b>${j.pontos}</b> pts</span>
        <span class="px-3 py-1.5 rounded-xl bg-gray-100 text-sm inline-flex items-center gap-1">${icone('timer', 'w-4 h-4')}<b id="tempo">${relogio()}</b></span>
        <button data-acao="niveis" class="${BTN2} ml-auto inline-flex items-center gap-2">${icone('corner-up-left', 'w-4 h-4')}Níveis</button>`;
    atualizarIcones();
}

function verificar() {
    const j = estado.jogo, r = avaliar(estado.eq, ...estado.coefs);
    j.tentativas++;
    if (r === 'ok') {
        // 2 pontos de primeira, 1 na segunda (ou de primeira com dica), 0 depois disso
        const ganhou = Math.max(0, 3 - j.tentativas - (j.usouDica ? 1 : 0));
        j.pontos += ganhou;
        confete();
        j.fase = 'certo';
        mensagem('smile', `${j.tentativas === 1 && !j.usouDica ? 'Perfeito, de primeira!' : 'Conseguiu!'} <b>+${ganhou} ponto${ganhou === 1 ? '' : 's'}</b>`, 'verde', `<button data-acao="proxima" class="${BTN} inline-flex items-center gap-2">Próxima ${icone('arrow-right', 'w-5 h-5')}</button>`);
    } else {
        const motivo = { zero: 'Toda substância precisa de pelo menos 1 molécula.', 'nao-simplificada': 'Está balanceada, mas dá para <b>dividir todos os números</b> e usar menores.' }[r] || 'Ainda não está balanceada. ' + diferencas();
        j.fase = 'errado';
        mensagem('circle-help', motivo + ' Ajuste e tente de novo!', 'vermelho',
            `<button data-acao="tentar" class="${BTN} inline-flex items-center gap-2">${icone('rotate-ccw', 'w-5 h-5')}Tentar de novo</button>${BOTAO_DICA()}`);
    }
    barraJogo();
    atualizar();
}

function fimDeJogo() {
    const j = estado.jogo, tempo = relogio();
    if (j.pontos >= 6) confete();
    try { localStorage.setItem('bal-recorde' + j.nivel, Math.max(j.pontos, recorde(j.nivel))); } catch {}
    estado.jogo = null;
    mostrarBancada(false);
    $('telaNivel').innerHTML = `
        <div class="mb-3 pop flex justify-center ${j.pontos === 10 ? 'text-yellow-500' : j.pontos >= 6 ? 'text-purple-600' : 'text-blue-600'}">${icone(j.pontos === 10 ? 'trophy' : j.pontos >= 6 ? 'party-popper' : 'dumbbell', 'w-12 h-12 md:w-16 md:h-16')}</div>
        <h2 class="text-2xl font-bold">Nível ${j.nivel + 1} concluído!</h2>
        <div class="text-3xl md:text-4xl my-2 md:my-3 tracking-wider">${estrelas(Math.round(j.pontos / 2))}</div>
        <p class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">${j.pontos} / 10 pontos</p>
        <p class="text-sm text-gray-500 mt-1 mb-4 md:mb-6 inline-flex self-center items-center gap-1">${icone('timer', 'w-4 h-4')}Tempo: ${tempo}</p>
        <div class="flex justify-center gap-2">
            <button data-acao="nivel" data-arg="${j.nivel}" class="${BTN} inline-flex items-center gap-2">${icone('rotate-ccw', 'w-5 h-5')}Jogar de novo</button>
            <button data-acao="niveis" class="${BTN2} inline-flex items-center gap-2">${icone('corner-up-left', 'w-4 h-4')}Níveis</button>
        </div>`;
    atualizarIcones();
}

// Chuva de confete ao acertar
function confete() {
    const cores = ['#9333ea', '#2563eb', '#facc15', '#22c55e', '#ef4444', '#ec4899'];
    for (let k = 0; k < 70; k++) {
        const c = document.createElement('span');
        c.className = 'confete';
        c.style.cssText = `left:${Math.random() * 100}vw;background:${cores[k % cores.length]};animation-duration:${1.5 + Math.random() * 1.2}s;animation-delay:${Math.random() * .4}s`;
        document.body.append(c);
        setTimeout(() => c.remove(), 3200);
    }
}

// ===== EVENTOS =====
const ACOES = {
    tutorial: abrirTutorial,
    passo: () => mostrarPasso(estado.passo + 1),
    pular: telaNiveis,
    nivel: n => iniciarJogo(+n),
    niveis: telaNiveis,
    verificar,
    tentar: () => { estado.jogo.fase = 'jogando'; atualizar(); pedirVerificacao('Mude a quantidade de moléculas e verifique de novo.'); },
    // Dica: entrega o número certo de UMA substância que ainda está errada (o resto o aluno descobre)
    dica: () => {
        const j = estado.jogo;
        const errada = estado.eq.flatMap((l, li) => l.map((m, i) => ({ m, atual: estado.coefs[li][i] }))).find(x => x.atual !== x.m.resposta);
        if (!errada) return;
        j.usouDica = true;
        j.fase = 'jogando';
        atualizar();
        pedirVerificacao(`Dica: use <b>${errada.m.resposta}</b> molécula${errada.m.resposta > 1 ? 's' : ''} de <b>${sub(errada.m.f)}</b>.`, 'cinza', 'lightbulb');
    },
    proxima: () => { estado.jogo.idx++; proximaEquacao(); },
    coef: arg => mudarCoef(...arg.split(',').map(Number)),
};

function mudarCoef(l, i, d) {
    if (travado()) return;
    estado.coefs[l][i] = Math.max(0, Math.min(MAX_COEF, estado.coefs[l][i] + d));
    atualizar();
}

// Arrastar a fórmula (embaixo) para dentro da caixa certa = +1 molécula
let pegando = null;
$('bancada').addEventListener('pointerdown', e => {
    const el = e.target.closest('.arrastavel');
    if (!el || travado()) return;
    pegando = { l: +el.dataset.l, i: +el.dataset.i };
    el.setPointerCapture(e.pointerId);
    $('caixa' + pegando.l).classList.add('ring-4', 'ring-purple-400');
    moverFantasma('+ ' + sub(estado.eq[pegando.l][pegando.i].f), e);
});
document.addEventListener('pointermove', e => pegando && moverFantasma('+ ' + sub(estado.eq[pegando.l][pegando.i].f), e));
const largar = e => {
    if (!pegando) return;
    const { l, i } = pegando;
    pegando = null;
    moverFantasma(null);
    $('caixa' + l).classList.remove('ring-4', 'ring-purple-400');
    if (e.type === 'pointerup' && document.elementFromPoint(e.clientX, e.clientY)?.closest('#caixa' + l)) mudarCoef(l, i, 1);
};
document.addEventListener('pointerup', largar);
document.addEventListener('pointercancel', largar);

document.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]');
    if (b && !b.disabled) ACOES[b.dataset.acao](b.dataset.arg);
});
$('bancada').addEventListener('input', e => {
    if (!e.target.classList.contains('coef')) return;
    const n = parseInt(e.target.value);
    if (isNaN(n)) return; // deixa apagar para digitar outro número
    estado.coefs[e.target.dataset.l][e.target.dataset.i] = Math.max(0, Math.min(MAX_COEF, n));
    atualizar();
});
$('bancada').addEventListener('focusout', e => e.target.classList.contains('coef') && atualizar());

abrirTutorial();
atualizarIcones();
