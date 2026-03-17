#!/usr/bin/env python3
"""
MySide Image Fetcher — Guia de Usuário
Professional PDF generator with MySide branding
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY, TA_RIGHT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, Frame, PageTemplate, BaseDocTemplate,
    Image as RLImage, NextPageTemplate, PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, Line
from reportlab.platypus.flowables import Flowable
import os

# ═══════════════════════════════════════════
# FONTS
# ═══════════════════════════════════════════

def register_fonts():
    # Try multiple common paths for Poppins
    paths_to_try = [
        "/usr/share/fonts/truetype/google-fonts",
        "/usr/share/fonts/truetype/poppins",
        "fonts", # Local folder
        ".",      # Current folder
        ".."      # Parent folder (root)
    ]
    
    font_loaded = False
    for path in paths_to_try:
        try:
            pdfmetrics.registerFont(TTFont("Poppins", os.path.join(path, "Poppins-Regular.ttf")))
            pdfmetrics.registerFont(TTFont("Poppins-Bold", os.path.join(path, "Poppins-Bold.ttf")))
            pdfmetrics.registerFont(TTFont("Poppins-Medium", os.path.join(path, "Poppins-Medium.ttf")))
            pdfmetrics.registerFont(TTFont("Poppins-Light", os.path.join(path, "Poppins-Light.ttf")))
            font_loaded = True
            print(f"Fonts loaded from: {path}")
            break
        except:
            continue
    
    if not font_loaded:
        print("Warning: Poppins font not found. Falling back to Helvetica.")
        # We'll use Helvetica as fallback, which is built-in
        # But we need to map the styles to use Helvetica
        global style_h1, style_h2, style_body, style_numbered, style_sub_bullet, style_tip_body
        return False
    return True

HAS_POPPINS = register_fonts()

# Mono font fallback
try:
    pdfmetrics.registerFont(TTFont("LiberationMono", "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"))
    HAS_MONO = True
except:
    HAS_MONO = False

# ═══════════════════════════════════════════
# LOGO
# ═══════════════════════════════════════════

LOGO_PATH = os.path.join(os.path.dirname(__file__), "..", "logo.png")
LOGO_ORIG_W, LOGO_ORIG_H = 820, 222

# ═══════════════════════════════════════════
# COLORS
# ═══════════════════════════════════════════

CORAL = HexColor("#FB414D")
AMBER = HexColor("#FFAD45")
DARK = HexColor("#0A0A0A")
GRAY_600 = HexColor("#555555")
GRAY_400 = HexColor("#888888")
GRAY_300 = HexColor("#AAAAAA")
GRAY_200 = HexColor("#D0D0D0")
GRAY_100 = HexColor("#E8E8E8")
GRAY_50 = HexColor("#F5F5F5")
WHITE = HexColor("#FFFFFF")

# ═══════════════════════════════════════════
# LINKS
# ═══════════════════════════════════════════

DRIVE_URL = "https://drive.google.com/drive/folders/1SnsAoE3Sx1T9oFIe6wOR8gLVyRwCe4UV?usp=drive_link"
REPO_URL = "https://github.com/mscarpenter-myside/image-fetcher"
CHROME_EXT_URL = "chrome://extensions/"

# ═══════════════════════════════════════════
# PAGE DIMENSIONS
# ═══════════════════════════════════════════

PAGE_W, PAGE_H = A4
MARGIN = 2.5 * cm
HEADER_H = 2.0 * cm
FOOTER_H = 1.2 * cm

# ═══════════════════════════════════════════
# STYLES
# ═══════════════════════════════════════════

style_h1 = ParagraphStyle(
    "H1", fontName="Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold", fontSize=18, leading=24,
    textColor=DARK, spaceBefore=2, spaceAfter=6,
)

style_h2 = ParagraphStyle(
    "H2", fontName="Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold", fontSize=13, leading=18,
    textColor=DARK, spaceBefore=4, spaceAfter=2,
)

style_body = ParagraphStyle(
    "Body", fontName="Poppins" if HAS_POPPINS else "Helvetica", fontSize=9.5, leading=16,
    textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=4,
)

style_numbered = ParagraphStyle(
    "Numbered", fontName="Poppins" if HAS_POPPINS else "Helvetica", fontSize=9.5, leading=16,
    textColor=DARK, alignment=TA_JUSTIFY, leftIndent=18, spaceAfter=3,
)

style_sub_bullet = ParagraphStyle(
    "SubBullet", fontName="Poppins" if HAS_POPPINS else "Helvetica", fontSize=9.5, leading=16,
    textColor=DARK, alignment=TA_JUSTIFY, leftIndent=36, spaceAfter=2,
)

style_tip_body = ParagraphStyle(
    "TipBody", fontName="Poppins" if HAS_POPPINS else "Helvetica", fontSize=9, leading=15,
    textColor=GRAY_600, alignment=TA_JUSTIFY, spaceAfter=3,
)

# ═══════════════════════════════════════════
# CUSTOM FLOWABLES
# ═══════════════════════════════════════════

class CoralLine(Flowable):
    def __init__(self, width, thickness=0.75):
        Flowable.__init__(self)
        self.width = width
        self.thickness = thickness
        self.height = thickness + 2

    def draw(self):
        self.canv.setStrokeColor(CORAL)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)


class TipBox(Flowable):
    def __init__(self, title, text, avail_width):
        Flowable.__init__(self)
        self.title_text = title
        self.body_text = text
        self.avail_width = avail_width
        self.box_height = 0
        self._build()

    def _build(self):
        self.title_para = Paragraph(
            f'<font name="{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}" size="9" color="#FB414D">{self.title_text}</font>',
            style_tip_body
        )
        self.body_para = Paragraph(self.body_text, style_tip_body)
        inner_w = self.avail_width - 24
        tw, th = self.title_para.wrap(inner_w, 1000)
        bw, bh = self.body_para.wrap(inner_w, 1000)
        self.box_height = th + bh + 20
        self.height = self.box_height + 8
        self.width = self.avail_width

    def draw(self):
        c = self.canv
        c.setFillColor(HexColor("#FAFAFA"))
        c.setStrokeColor(GRAY_200)
        c.setLineWidth(0.5)
        c.roundRect(0, 0, self.avail_width, self.box_height, 4, fill=1, stroke=1)
        c.setFillColor(CORAL)
        c.rect(0, 0, 3, self.box_height, fill=1, stroke=0)
        inner_w = self.avail_width - 24
        tw, th = self.title_para.wrap(inner_w, 1000)
        self.title_para.drawOn(c, 14, self.box_height - th - 8)
        bw, bh = self.body_para.wrap(inner_w, 1000)
        self.body_para.drawOn(c, 14, self.box_height - th - bh - 12)


class DriveButton(Flowable):
    """A styled download button linking to Google Drive."""
    def __init__(self, url, avail_width):
        Flowable.__init__(self)
        self.url = url
        self.btn_w = 220
        self.btn_h = 34
        self.avail_width = avail_width
        self.width = avail_width
        self.height = self.btn_h + 12

    def draw(self):
        c = self.canv
        x = (self.avail_width - self.btn_w) / 2
        y = 6
        # Button background
        c.setFillColor(CORAL)
        c.roundRect(x, y, self.btn_w, self.btn_h, 6, fill=1, stroke=0)
        # Button text
        c.setFillColor(WHITE)
        c.setFont("Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold", 9.5)
        text = "Baixar Extensão (Google Drive)"
        tw = c.stringWidth(text, "Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold", 9.5)
        c.drawString(x + (self.btn_w - tw) / 2, y + 12, text)
        # Link area
        c.linkURL(self.url, (x, y, x + self.btn_w, y + self.btn_h), relative=0)


class JSAnnotation:
    """PDF annotation with a JavaScript action — works in Acrobat/Foxit."""
    def __init__(self, rect, js_code):
        self.rect = rect
        self.js_code = js_code

    def format(self, document):
        r = self.rect
        # Hex-encode the JS string for safe PDF embedding
        js_hex = self.js_code.encode('utf-16-be').hex()
        return (
            f'<< /Type /Annot /Subtype /Link '
            f'/Rect [{r[0]:.2f} {r[1]:.2f} {r[2]:.2f} {r[3]:.2f}] '
            f'/Border [0 0 0] /H /I '
            f'/A << /S /JavaScript /JS <FEFF{js_hex}> >> >>'
        ).encode('latin-1')


class CopyBadge(Flowable):
    """A styled code box with a working 'Copiar' button that copies to clipboard."""
    def __init__(self, text, avail_width):
        Flowable.__init__(self)
        self.text = text
        self.avail_width = avail_width
        self.box_h = 26
        self.width = avail_width
        self.height = self.box_h

    def draw(self):
        c = self.canv
        # Align box with text indent (18)
        x0 = 18 
        box_w = self.avail_width - x0 - 18 # Balanced margins
        y = 0 # No internal padding
        c.setFillColor(HexColor("#F5F5F5"))
        c.setStrokeColor(GRAY_200)
        c.setLineWidth(0.5)
        c.roundRect(x0, y, box_w, self.box_h, 5, fill=1, stroke=1)
        # URL text
        c.setFont("LiberationMono" if HAS_MONO else "Courier", 9.5)
        c.setFillColor(DARK)
        c.drawString(x0 + 12, y + 9.5, self.text)


# ═══════════════════════════════════════════
# HEADER & FOOTER
# ═══════════════════════════════════════════

def draw_header_footer(canvas, doc):
    canvas.saveState()

    # Header background
    canvas.setFillColor(DARK)
    canvas.rect(0, PAGE_H - HEADER_H, PAGE_W, HEADER_H, fill=1, stroke=0)

    # Logo PNG (left)
    logo_h = 11 * mm
    logo_w = logo_h * (LOGO_ORIG_W / LOGO_ORIG_H)
    logo_y = PAGE_H - HEADER_H + (HEADER_H - logo_h) / 2
    canvas.drawImage(
        LOGO_PATH, MARGIN, logo_y, logo_w, logo_h,
        preserveAspectRatio=True, mask='auto'
    )

    # Right text
    canvas.setFont("Poppins-Light" if HAS_POPPINS else "Helvetica", 8)
    canvas.setFillColor(GRAY_400)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - HEADER_H + (HEADER_H / 2) - 2, "Guia de Usuário  |  MySide Image Fetcher")

    # Coral line under header
    canvas.setStrokeColor(CORAL)
    canvas.setLineWidth(1.5)
    canvas.line(0, PAGE_H - HEADER_H, PAGE_W, PAGE_H - HEADER_H)

    # Footer
    canvas.setFont("Poppins" if HAS_POPPINS else "Helvetica", 7.5)
    canvas.setFillColor(GRAY_300)
    canvas.drawRightString(PAGE_W - MARGIN, FOOTER_H - 6*mm, f"Página {doc.page}")
    canvas.drawString(MARGIN, FOOTER_H - 6*mm, "MySide · Engenharia de Conteúdo & Automação")
    canvas.setStrokeColor(GRAY_200)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, FOOTER_H, PAGE_W - MARGIN, FOOTER_H)

    canvas.restoreState()


def draw_cover_header(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(DARK)
    canvas.rect(0, PAGE_H - HEADER_H, PAGE_W, HEADER_H, fill=1, stroke=0)
    canvas.setStrokeColor(CORAL)
    canvas.setLineWidth(1.5)
    canvas.line(0, PAGE_H - HEADER_H, PAGE_W, PAGE_H - HEADER_H)
    canvas.restoreState()


# ═══════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════

def coral_num(n):
    return f'<font name="{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}" color="#FB414D">{n}.</font>'

def coral_bullet():
    return f'<font name="{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}" color="#FB414D">●</font>&nbsp;&nbsp;'

def bold(text):
    return f'<font name="{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}">{text}</font>'

def code(text):
    return f'<font name="{"LiberationMono" if HAS_MONO else "Courier"}" size="8.5" color="#333333">{text}</font>'

def link(url, label=None):
    display = label or url
    return f'<a href="{url}" color="#FB414D"><font color="#FB414D">{display}</font></a>'


# ═══════════════════════════════════════════
# BUILD DOCUMENT
# ═══════════════════════════════════════════

OUTPUT_PATH = "guia-image-fetcher.pdf"
CONTENT_W = PAGE_W - 2 * MARGIN

doc = BaseDocTemplate(
    OUTPUT_PATH,
    pagesize=A4,
    leftMargin=MARGIN,
    rightMargin=MARGIN,
    topMargin=HEADER_H + 0.8*cm,
    bottomMargin=FOOTER_H + 0.5*cm,
    title="Guia de Usuário | MySide Image Fetcher",
    author="MySide · Engenharia de Conteúdo & Automação",
)

content_frame = Frame(
    MARGIN, FOOTER_H + 0.5*cm,
    CONTENT_W, PAGE_H - HEADER_H - FOOTER_H - 1.3*cm,
    id="content"
)
cover_frame = Frame(
    MARGIN, FOOTER_H + 0.5*cm,
    CONTENT_W, PAGE_H - HEADER_H - FOOTER_H - 1.3*cm,
    id="cover"
)
doc.addPageTemplates([
    PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover_header),
    PageTemplate(id="Content", frames=[content_frame], onPage=draw_header_footer),
])

# ═══════════════════════════════════════════
# STORY
# ═══════════════════════════════════════════

story = []

# ── COVER PAGE ──

story.append(Spacer(1, 4*cm))

# Logo text on cover
story.append(Paragraph(
    f'<font name="{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}" size="42" color="#FB414D">MySide</font>',
    ParagraphStyle("LogoLarge", alignment=TA_LEFT, leading=48)
))

story.append(Spacer(1, 5*mm))
story.append(CoralLine(CONTENT_W, 2))
story.append(Spacer(1, 6*mm))

story.append(Paragraph("Image Fetcher", ParagraphStyle(
    "CoverTitle", fontName="Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold", fontSize=24, leading=30, textColor=DARK
)))
story.append(Spacer(1, 3*mm))
story.append(Paragraph("Guia de Usuário", ParagraphStyle(
    "CoverSub", fontName="Poppins-Light" if HAS_POPPINS else "Helvetica", fontSize=16, leading=22, textColor=GRAY_400
)))
story.append(Spacer(1, 8*mm))
story.append(Paragraph(
    "Otimização de Imagens e SEO Imobiliário",
    ParagraphStyle("CoverTag", fontName="Poppins" if HAS_POPPINS else "Helvetica", fontSize=10, leading=14, textColor=GRAY_400)
))

story.append(Spacer(1, 3*cm))

# Cover info box
info_data = [
    ["Versão", "1.0"],
    ["Plataforma", "Google Chrome (extensão)"],
    ["Departamento", "Engenharia de Conteúdo & Automação"],
]
info_table = Table(info_data, colWidths=[3.5*cm, 10*cm])
info_table.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (0, -1), "Poppins-Medium" if HAS_POPPINS else "Helvetica-Bold"),
    ("FONTNAME", (1, 0), (1, -1), "Poppins" if HAS_POPPINS else "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("TEXTCOLOR", (0, 0), (0, -1), GRAY_400),
    ("TEXTCOLOR", (1, 0), (1, -1), DARK),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("LINEBELOW", (0, 0), (-1, -2), 0.5, GRAY_100),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 0),
]))
story.append(info_table)

story.append(Spacer(1, 1.5*cm))

# Page break
story.append(NextPageTemplate("Content"))
story.append(PageBreak())

# ═══════════════════════════════════════════
# SECTION 1 — INSTALAÇÃO
# ═══════════════════════════════════════════

story.append(Paragraph("1. Instalação Passo a Passo", style_h1))
story.append(CoralLine(CONTENT_W))
story.append(Spacer(1, 4*mm))

story.append(Paragraph(
    f"Para começar a usar o {bold('MySide Image Fetcher')}, siga o guia abaixo:",
    style_body
))
story.append(Spacer(1, 2*mm))

install_steps = [
    (f"{bold('Baixar o Projeto')}",
     f"Acesse o {link(DRIVE_URL, 'Google Drive')} para baixar o arquivo ZIP da extensão."),

    (f"{bold('Descompactar')}",
     f"Extraia o conteúdo do arquivo {code('.zip')} em uma pasta de sua preferência no computador."),

    (f"{bold('Abrir o Chrome')}",
     f"No navegador Google Chrome, copie e cole o endereço abaixo na barra de navegação:"),

    (f"{bold('Modo do Desenvolvedor')}",
     f"No canto superior direito da página, ative a chave {bold('\"Modo do desenvolvedor\"')}."),

    (f"{bold('Carregar Extensão')}",
     f"Clique no botão {bold('\"Carregar sem compactação\"')} que apareceu no canto superior esquerdo. Selecione a pasta onde você descompactou os arquivos (a pasta que contém o arquivo {code('manifest.json')})."),

    (f"{bold('Fixar a Extensão')}",
     f"Clique no ícone de Extensões ao lado da barra de endereços do Chrome e clique no pin ao lado do {bold('MySide Image Fetcher')} para deixá-lo sempre visível."),
]

for i, (title, desc) in enumerate(install_steps, 1):
    story.append(Paragraph(
        f"{coral_num(i)}&nbsp;&nbsp;{title} — {desc}",
        style_numbered
    ))
    # Insert CopyBadge right after step 3
    if i == 3:
        story.append(Spacer(1, 1.2*mm))
        story.append(CopyBadge("chrome://extensions/", CONTENT_W))
        story.append(Spacer(1, 2.5*mm))



# ═══════════════════════════════════════════
# SECTION 2 — FUNCIONALIDADES
# ═══════════════════════════════════════════
story.append(Paragraph("2. Como Utilizar as Funcionalidades", style_h1))
story.append(CoralLine(CONTENT_W))
story.append(Spacer(1, 2*mm))

# 2.1
story.append(Paragraph("Capturando Imagens", style_h2))
story.append(Paragraph(
    "Navegue em qualquer site e, ao encontrar uma imagem que deseja baixar:",
    style_body
))
story.append(Spacer(1, 1*mm))

capture_steps = [
    f"Clique com o {bold('botão direito')} sobre a imagem.",
    f"Selecione a opção {bold('\"Enviar para MySide Image Fetcher\"')}.",
    "O painel lateral abrirá automaticamente com a imagem carregada.",
]
for i, step in enumerate(capture_steps, 1):
    story.append(Paragraph(f"{coral_num(i)}&nbsp;&nbsp;{step}", style_numbered))


story.append(Spacer(1, 1*mm))

# 2.2
story.append(Paragraph("Configurando a Nomenclatura SEO", style_h2))
story.append(Paragraph(
    "No painel lateral, você encontrará os campos para processamento:",
    style_body
))
story.append(Spacer(1, 1*mm))

story.append(Paragraph(
    f"{coral_num(1)}&nbsp;&nbsp;{bold('Tipo de Imagem:')} Selecione entre {bold('Capa')} (máximo 100kb) ou {bold('Corpo')} (máximo 150kb). A extensão aplicará a compressão ideal automaticamente.",
    style_numbered
))
story.append(Paragraph(
    f"{coral_num(2)}&nbsp;&nbsp;{bold('Descrição (Opcional):')} Dois campos para adicionar detalhes descritivos da imagem, como tipo de vista ou nome do empreendimento.",
    style_numbered
))
story.append(Paragraph(
    f"{coral_num(3)}&nbsp;&nbsp;{bold('Bairro e Cidade:')}",
    style_numbered
))

sub_items = [
    f"{bold('Autocomplete:')} Comece a digitar e a extensão sugerirá o nome. Aperte {code('Tab')} ou {code('Enter')} para aceitar.",
    f"{bold('Auto-Preenchimento:')} Ao preencher o Bairro, a Cidade será preenchida automaticamente se for um bairro único em nossa base.",
    f"{bold('City Picker:')} Se o bairro existir em mais de uma cidade, um seletor aparecerá para você escolher a correta usando as setas do teclado.",
]
for item in sub_items:
    story.append(Paragraph(f"{coral_bullet()}{item}", style_sub_bullet))


story.append(Spacer(1, 1*mm))

# 2.3
story.append(Paragraph("Processar e Baixar", style_h2))
story.append(Paragraph(
    f"Clique no botão {bold('\"Processar e Baixar\"')}. A extensão irá:",
    style_body
))
story.append(Spacer(1, 1*mm))

process_steps = [
    f"Redimensionar a imagem para exatamente {bold('747px')} de largura.",
    "Comprimir o arquivo para o limite de peso selecionado (mantendo a melhor qualidade possível).",
    f"Renomear o arquivo no padrão: {code('descricao-bairro-cidade.jpg')}.",
    "Abrir a janela de salvamento do sistema operacional.",
]
for i, step in enumerate(process_steps, 1):
    story.append(Paragraph(f"{coral_num(i)}&nbsp;&nbsp;{step}", style_numbered))



# ═══════════════════════════════════════════
# SECTION 3 — DICAS
# ═══════════════════════════════════════════
story.append(Paragraph("3. Dicas", style_h1))
story.append(CoralLine(CONTENT_W))
story.append(Spacer(1, 4*mm))

story.append(TipBox(
    "Temas",
    f"No topo do painel, você pode alternar entre os temas <font name='{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}'>Dark</font>, <font name='{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}'>Light</font> e o <font name='{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}'>MySide</font> theme.",
    CONTENT_W
))
story.append(Spacer(1, 4*mm))

story.append(TipBox(
    "Correção Rápida",
    f"Errou a cidade no seletor? Clique novamente no campo <font name='{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}'>Cidade</font> para reabrir as opções disponíveis para aquele bairro sem precisar redigitar tudo.",
    CONTENT_W
))

story.append(Spacer(1, 1.5*cm))

# Footer attribution
story.append(CoralLine(CONTENT_W, 0.5))
story.append(Spacer(1, 3*mm))
story.append(Paragraph(
    f"<font name='{"Poppins-Medium" if HAS_POPPINS else "Helvetica-Bold"}' size='8' color='#888888'>Engenharia de Conteúdo &amp; Automação · </font>"
    f"<font name='{"Poppins-Bold" if HAS_POPPINS else "Helvetica-Bold"}' size='8' color='#FB414D'>MySide</font>"
    f"&nbsp;&nbsp;·&nbsp;&nbsp;<a href='{REPO_URL}' color='#AAAAAA'><font size='7' color='#AAAAAA'>Acessar Repositório</font></a>",
    ParagraphStyle("EndNote", alignment=TA_LEFT)
))

# ═══════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════

doc.build(story)
print(f"PDF gerado: {OUTPUT_PATH}")
print(f"Tamanho: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")