from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER

INPUT_FILE = "SYSTEM_ARCHITECTURE.txt"
OUTPUT_FILE = "SYSTEM_ARCHITECTURE.pdf"

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontSize=18,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1B3A6B"),
        alignment=TA_CENTER,
        spaceAfter=6,
    )

    section_style = ParagraphStyle(
        "Section",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1B7F79"),
        spaceBefore=10,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=8.5,
        fontName="Courier",
        leading=13,
        textColor=colors.HexColor("#222222"),
        spaceAfter=2,
    )

    separator_style = ParagraphStyle(
        "Sep",
        parent=styles["Normal"],
        fontSize=7,
        fontName="Courier",
        textColor=colors.HexColor("#888888"),
        spaceAfter=2,
    )

    story = []

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for line in lines:
        text = line.rstrip("\n")
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        # Top-level separator lines (===)
        if text.startswith("===") and len(text.strip("=")) < 5:
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1B7F79"), spaceAfter=4))
            continue

        # Section headers (lines starting with a digit and a dot, or all-caps headings)
        if (text.startswith("================") or text.startswith("----------------")):
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CCCCCC"), spaceAfter=2))
            continue

        # Detect section title lines (e.g. "1. TECH STACK" or "PRATIPAL STORE — COMPLETE...")
        stripped = text.strip()
        if stripped and all(c.isupper() or c in " .0123456789—-&/()" for c in stripped) and len(stripped) > 4 and not stripped.startswith("-") and not stripped.startswith("*"):
            story.append(Paragraph(escaped, section_style))
            continue

        # Empty lines → small spacer
        if stripped == "":
            story.append(Spacer(1, 3))
            continue

        # Everything else → monospace body
        story.append(Paragraph(escaped, body_style))

    doc.build(story)
    print(f"PDF created: {OUTPUT_FILE}")

if __name__ == "__main__":
    build_pdf()
