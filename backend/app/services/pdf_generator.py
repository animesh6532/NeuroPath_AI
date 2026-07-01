import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(session_id: str, candidate_info: dict, scores: dict, analytics: dict, roadmap: list) -> str:
    # Ensure static directory exists
    dir_path = "static/reports"
    os.makedirs(dir_path, exist_ok=True)
    pdf_filename = f"{session_id}_report.pdf"
    pdf_path = os.path.join(dir_path, pdf_filename)
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    # Color palette
    c_primary = colors.HexColor("#1e293b")   # Slate 800
    c_secondary = colors.HexColor("#4f46e5") # Indigo 600
    c_accent = colors.HexColor("#0f766e")    # Teal 700
    c_danger = colors.HexColor("#be123c")    # Rose 700
    c_light = colors.HexColor("#f8fafc")     # Slate 50
    c_border = colors.HexColor("#e2e8f0")    # Slate 200
    c_text = colors.HexColor("#334155")      # Slate 700

    styles = getSampleStyleSheet()
    
    # Custom styles
    style_title = ParagraphStyle(
        name='DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_secondary,
        spaceAfter=15
    )
    
    style_subtitle = ParagraphStyle(
        name='DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_text,
        spaceAfter=25
    )
    
    style_h1 = ParagraphStyle(
        name='DocH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=c_primary,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )
    
    style_body = ParagraphStyle(
        name='DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_text,
        spaceAfter=8
    )

    style_body_bold = ParagraphStyle(
        name='DocBodyBold',
        parent=style_body,
        fontName='Helvetica-Bold'
    )

    style_bullet = ParagraphStyle(
        name='DocBullet',
        parent=style_body,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    story = []
    
    # 1. Header
    story.append(Paragraph("NeuroPath AI", ParagraphStyle('SubBrand', fontName='Helvetica-Bold', fontSize=10, textColor=c_accent)))
    story.append(Paragraph("INTERVIEW EVALUATION REPORT", style_title))
    story.append(Paragraph(f"Candidate Profile & Technical Performance Analysis • Session: {session_id}", style_subtitle))
    story.append(Spacer(1, 10))
    
    # 2. Candidate Metadata
    meta_data = [
        [Paragraph("<b>Candidate Name:</b>", style_body), Paragraph(candidate_info.get("name", "N/A"), style_body),
         Paragraph("<b>Date:</b>", style_body), Paragraph(candidate_info.get("date", "N/A"), style_body)],
        [Paragraph("<b>Email:</b>", style_body), Paragraph(candidate_info.get("email", "N/A"), style_body),
         Paragraph("<b>Target Industry:</b>", style_body), Paragraph(candidate_info.get("industry", "N/A"), style_body)],
        [Paragraph("<b>Target Role:</b>", style_body), Paragraph(candidate_info.get("role", "N/A"), style_body),
         Paragraph("<b>Experience Level:</b>", style_body), Paragraph(candidate_info.get("level", "N/A"), style_body)]
    ]
    t_meta = Table(meta_data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,-1), (-1,-1), 1, c_border),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 20))
    
    # 3. Scores Matrix
    story.append(Paragraph("Performance Metrics Breakdown", style_h1))
    
    # White headers for inside the table
    header_style_w = ParagraphStyle('HeadWhite', parent=style_body_bold, textColor=colors.white)
    
    score_data = [
        [Paragraph("<b>Evaluation Category</b>", header_style_w), Paragraph("<b>Score (0-100)</b>", header_style_w), Paragraph("<b>Assessment</b>", header_style_w)],
        [Paragraph("Overall Interview Score", style_body), Paragraph(str(scores.get("overall", 0)), style_body), Paragraph("Strong fit" if scores.get("overall", 0) >= 80 else ("Average" if scores.get("overall", 0) >= 60 else "Requires training"), style_body)],
        [Paragraph("Technical Competence", style_body), Paragraph(str(scores.get("technical", 0)), style_body), Paragraph("Excellent" if scores.get("technical", 0) >= 80 else ("Competent" if scores.get("technical", 0) >= 60 else "Skill gaps present"), style_body)],
        [Paragraph("Communication Skills", style_body), Paragraph(str(scores.get("communication", 0)), style_body), Paragraph("Fluent & Structured" if scores.get("communication", 0) >= 80 else "Clear but verbose" if scores.get("communication", 0) >= 60 else "Lacks structured delivery", style_body)],
        [Paragraph("Confidence & Clarity", style_body), Paragraph(str(scores.get("confidence", 0)), style_body), Paragraph("Highly Confident" if scores.get("confidence", 0) >= 80 else "Calm" if scores.get("confidence", 0) >= 60 else "Uncertain / Short explanations", style_body)],
        [Paragraph("Problem Solving & Logic", style_body), Paragraph(str(scores.get("problem_solving", 0)), style_body), Paragraph("Strong analytical mindset" if scores.get("problem_solving", 0) >= 80 else "Capable" if scores.get("problem_solving", 0) >= 60 else "Struggled with parameters", style_body)],
        [Paragraph("Behavioural & Culture", style_body), Paragraph(str(scores.get("behavioural", 0)), style_body), Paragraph("High alignment" if scores.get("behavioural", 0) >= 80 else "Aligned" if scores.get("behavioural", 0) >= 60 else "Low conflict handling depth", style_body)],
        [Paragraph("HR & Professionalism", style_body), Paragraph(str(scores.get("hr", 0)), style_body), Paragraph("Fully aligned" if scores.get("hr", 0) >= 80 else "Aligned", style_body)],
        [Paragraph("Project Discussion Depth", style_body), Paragraph(str(scores.get("project", 0)), style_body), Paragraph("Exceptional description" if scores.get("project", 0) >= 80 else "Good overview" if scores.get("project", 0) >= 60 else "Lacked technical details", style_body)],
    ]
    t_scores = Table(score_data, colWidths=[2.5*inch, 1.5*inch, 3*inch])
    t_scores.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light]),
    ]))
    
    story.append(t_scores)
    story.append(Spacer(1, 20))
    
    # 4. Key Strengths & Weaknesses
    story.append(Paragraph("Qualitative Analysis", style_h1))
    
    sw_data = []
    strengths = analytics.get("strengths", [])
    weaknesses = analytics.get("weaknesses", [])
    
    s_col = []
    s_col.append(Paragraph("<b>Strengths</b>", ParagraphStyle('StrengthTitle', parent=style_body_bold, textColor=c_accent)))
    for s in strengths:
        s_col.append(Paragraph(f"• {s}", style_bullet))
        
    w_col = []
    w_col.append(Paragraph("<b>Areas for Improvement</b>", ParagraphStyle('WeakTitle', parent=style_body_bold, textColor=c_danger)))
    for w in weaknesses:
        w_col.append(Paragraph(f"• {w}", style_bullet))
        
    # Pad to match row count
    max_len = max(len(s_col), len(w_col))
    s_col.extend([Paragraph("", style_body)] * (max_len - len(s_col)))
    w_col.extend([Paragraph("", style_body)] * (max_len - len(w_col)))
    
    for i in range(max_len):
        sw_data.append([s_col[i], w_col[i]])
        
    t_sw = Table(sw_data, colWidths=[3.4*inch, 3.4*inch])
    t_sw.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f0fdf4")), # Green tint for strengths
        ('BACKGROUND', (1,0), (1,-1), colors.HexColor("#fff1f2")), # Red tint for weaknesses
        ('BOX', (0,0), (0,-1), 0.5, colors.HexColor("#bbf7d0")),
        ('BOX', (1,0), (1,-1), 0.5, colors.HexColor("#fecdd3")),
    ]))
    story.append(t_sw)
    story.append(Spacer(1, 20))
    
    # Page Break for Roadmap
    story.append(PageBreak())
    
    # 5. Roadmap & Skill Gaps
    story.append(Paragraph("Actionable Career Learning Roadmap", style_h1))
    
    gaps = analytics.get("skill_gaps", [])
    if gaps:
        story.append(Paragraph(f"<b>Core Skill Gaps Detected:</b> {', '.join(gaps)}", style_body_bold))
        story.append(Spacer(1, 8))
        
    recommendation = analytics.get("hiring_recommendation", "N/A")
    readiness = analytics.get("career_readiness", "N/A")
    
    rec_style = ParagraphStyle(
        'RecStyle',
        parent=style_body_bold,
        textColor=c_accent if "Hire" in recommendation else c_danger
    )
    
    story.append(Paragraph(f"<b>Hiring Recommendation:</b> {recommendation}", rec_style))
    story.append(Paragraph(f"<b>Career Readiness Alignment:</b> {readiness}", style_body_bold))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("We recommend focusing on the following structured learning steps to address the detected skill gaps:", style_body))
    story.append(Spacer(1, 10))
    
    for r in roadmap:
        skill_title = Paragraph(f"<b>{r.get('skill', 'Technology')}</b> ({r.get('level', 'Intermediate')} Level)", ParagraphStyle('SkillTitle', parent=style_body_bold, textColor=c_secondary))
        story.append(skill_title)
        
        steps = r.get("steps", [])
        for s in steps:
            story.append(Paragraph(f"• {s}", style_bullet))
            
        resources = r.get("resources", [])
        if resources:
            story.append(Paragraph(f"<i>Recommended Resources:</i> {', '.join(resources)}", ParagraphStyle('ResourceItalic', parent=style_body, fontName='Helvetica-Oblique', fontSize=9)))
            
        story.append(Spacer(1, 12))

    # Build the document
    doc.build(story)
    return pdf_path
