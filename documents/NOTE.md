# Visual Editor Service
Everything in the Visual Content Editor (RichTextBox.tsx) is 100% custom-built in-house within this application. It does not rely on any 3rd-party rich text editor libraries or paid SaaS editor services (such as TinyMCE, CKEditor, Quill, Froala, or TipTap).

Key Highlights of the Architecture:
Native Browser designMode & DOM APIs

Built using an isolated <iframe> element with document.designMode = "on".
Standard formatting (bold, italic, lists, headers, text colors, background highlights, alignment) and DOM node manipulation are handled directly through native browser APIs.
Custom Component & Layout Toolbox

Visual component insertion (callout boxes, badges, quote blocks, responsive grid columns, action buttons, alert boxes, data tables) is generated via custom inline HTML templates.
React UI & Modal Integrations

Toolbar & Tabs: Switch between Visual Editor, Live Preview, and Raw HTML source code views.
Hyperlink Creator: Custom hyperlink modal with styling options (plain text, action buttons, pill badges, target options).
Image Studio & Crop/Resize Tool: Custom React modal for image manipulation.
Cloudinary Integration: Uses Cloudinary only as the backend asset storage service for uploaded images.