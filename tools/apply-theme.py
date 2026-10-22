#!/usr/bin/env python3
"""Nhúng theme.css vào mọi màn (giữ inline để plugin HTML→Figma vẫn đọc được).
Chạy từ thư mục gốc dự án: python3 tools/apply-theme.py"""
import glob,re
css=open('theme.css',encoding='utf-8').read().strip()
block='<style id="theme">\n'+css+'\n</style>'
n=0
for f in sorted(glob.glob('[0-9]*.html'))+['index.html']:
    if f=='index.html': continue
    s=open(f,encoding='utf-8').read()
    new,k=re.subn(r'<style id="(?:theme|flutter-m3)">.*?</style>',lambda m:block,s,count=1,flags=re.S)
    if not k:
        new=s.replace('</head>',block+'\n</head>',1)
    if new!=s: open(f,'w',encoding='utf-8').write(new); n+=1
print('đã cập nhật',n,'file')
