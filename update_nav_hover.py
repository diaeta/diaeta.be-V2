from pathlib import Path
path = Path(r'src/styles/layout/_header.scss')
text = path.read_text()
old = "  &:focus-within .nav-sub {\n    opacity: 1;\n    transform: translateY(0);\n    pointer-events: auto;\n  }\n}\n"
new = "  &:focus-within .nav-sub,\n  &:hover .nav-sub {\n    opacity: 1;\n    transform: translateY(0);\n    pointer-events: auto;\n    visibility: visible;\n  }\n}\n"
if old not in text:
    raise SystemExit('nav__item--has-sub block not found')
path.write_text(text.replace(old, new, 1))
