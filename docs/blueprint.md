# **App Name**: RefAuto

## Core Features:

- User Authentication & Roles: User Authentication supporting two roles: admin (manages users) and researcher (can upload documents, select styles, reformat references, but not manage users).
- Document Upload: Document Upload from .docx or .pdf files.
- Reference Style Mapping: Uses an LLM tool to automatically map detected references to a selected citation style based on its comprehensive understanding of formatting guidelines and citation requirements. It identifies and tags key components within each reference entry, such as authors, publication years, titles, and sources. Supports integration with Mendeley/Zotero.
- Automatic reformatting & Tagging: Automatically rewrite in-text citations, add necessary tags, number them correctly according to the selected referencing style, and creates Word-compatible citation fields for automatic updates. Generates a new .docx file with updated formatting that Microsoft Word recognizes as citations and references.
- Reference auto-increment: Upon a new reference insertion, automatically detect the last reference number used and continues numbering from the subsequent integer, creating in-text citations matching the right formatting.
- Manual Correction UI: A manual correction User Interface enabling correction of any parsing errors
- Citation style selection: Allowing to select citation style

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), evoking a sense of trust and intellectualism.
- Background color: Light gray (#F5F5F5), for a clean, neutral backdrop.
- Accent color: Purple (#7E57C2), used to draw the user's eye to important interactions.
- Body font: 'Inter' sans-serif for the main content. Headline font: 'Space Grotesk' sans-serif for headers to ensure clarity and readability.
- Icons: Clean and professional line icons that clearly represent actions and tools, ensuring ease of understanding and a modern feel.
- Use a clean, well-structured layout. The design will ensure key information is easily accessible. White space should be used strategically to avoid a cluttered appearance.
- Use subtle animations. Transitions on interactions help guide users, without distracting from the content.