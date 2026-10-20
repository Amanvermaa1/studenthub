import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Close, Image as ImageIcon, FileText, Eye, Edit } from "../Icons.jsx";
import { renderMarkdown, extractHashtags } from "../lib/markdown.js";
import { API } from "../api/client.js";
import { notify } from "../components/Toast.jsx";

/* =====================================================
   CREATE POST
   ===================================================== */

function CreatePost({ createPost, token }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("write"); // write | preview
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const handleImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleAttachments = (event) => {
    const files = Array.from(event.target.files);
    const valid = files.filter(f => {
      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip",
        "application/x-zip-compressed",
      ];
      if (!allowed.includes(f.type)) {
        alert(`File type not allowed: ${f.name}`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        alert(`File too large (max 10MB): ${f.name}`);
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...valid]);
    event.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("subject", subject);

    if (image) formData.append("image", image);

    const created = await createPost(formData);

    // Attachments are uploaded separately once the post exists
    if (created && created.id && attachments.length > 0) {
      for (const file of attachments) {
        try {
          const attachmentForm = new FormData();
          attachmentForm.append("file", file);

          const response = await fetch(`${API}/posts/${created.id}/attachments`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: attachmentForm,
          });

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            notify(
              `Attachment skipped: ${file.name} (${data.message || "upload failed"})`,
              "error"
            );
          }
        } catch (error) {
          console.error(error);
          notify(`Attachment failed: ${file.name}`, "error");
        }
      }
    }

    setBusy(false);

    if (created) {
      setTitle("");
      setContent("");
      setSubject("");
      setImage(null);
      setPreview(null);
      setAttachments([]);
      navigate("/");
    }
  };

  const hashtags = extractHashtags(content);

  return (
    <main className="form-page">
      <div className="form-card">
        <section className="page-header">
          <div>
            <span className="eyebrow-plain">New post</span>
            <h1>Share something useful</h1>
            <p>Write in Markdown. Attach PDFs, docs, or images.</p>
          </div>
        </section>

        <form onSubmit={submit}>
          <div className="field-block">
            <label className="label" htmlFor="post-title">
              Title
            </label>
            <input
              id="post-title"
              className="input"
              type="text"
              placeholder="e.g. Understanding SQL joins in 5 minutes"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="field-block">
            <label className="label" htmlFor="post-subject">
              Subject
            </label>
            <select
              id="post-subject"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            >
              <option value="">Select subject</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
              <option value="sql">SQL</option>
              <option value="dsa">DSA</option>
              <option value="dbms">DBMS</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field-block">
            <div className="editor-toolbar">
              <button
                type="button"
                className={`toolbar-btn${mode === "write" ? " active" : ""}`}
                onClick={() => setMode("write")}
                title="Write"
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className={`toolbar-btn${mode === "preview" ? " active" : ""}`}
                onClick={() => setMode("preview")}
                title="Preview"
              >
                <Eye size={16} />
              </button>
            </div>

            <label className="label" htmlFor="post-content">
              Content {mode === "write" && "(Markdown)"}
            </label>

            {mode === "write" && (
              <textarea
                ref={textareaRef}
                id="post-content"
                className="input markdown-editor"
                placeholder="Write your post... Supports **bold**, *italic*, `code`, ```code blocks```, # Headings, - Lists, > Quotes, [links](url), and #hashtags"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                spellCheck="false"
              />
            )}

            {mode === "preview" && (
              <div
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            )}

            {hashtags.length > 0 && (
              <div className="hashtag-suggestions">
                <span className="hashtag-label">Hashtags:</span>
                {hashtags.map(tag => (
                  <span key={tag} className="hashtag-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="field-block">
            <span className="label">Image (optional)</span>
            <label className="file-picker">
              <input type="file" accept="image/*" onChange={handleImage} />
              <ImageIcon size={17} />
              {image ? "Change image" : "Choose image"}
            </label>
            <p className="hint">JPG or PNG, up to 5MB.</p>

            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Selected preview" />
                <button
                  type="button"
                  className="preview-remove"
                  onClick={clearImage}
                  aria-label="Remove selected image"
                >
                  <Close size={15} />
                </button>
              </div>
            )}
          </div>

          <div className="field-block">
            <span className="label">Attachments (optional)</span>
            <label className="file-picker">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip"
                multiple
                onChange={handleAttachments}
              />
              <FileText size={17} />
              {attachments.length > 0 ? `${attachments.length} file(s) attached` : "Choose files"}
            </label>
            <p className="hint">PDF, DOC, DOCX, ZIP — up to 10MB each.</p>

            {attachments.length > 0 && (
              <div className="attachment-list">
                {attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <FileText size={16} />
                    <span>{file.name}</span>
                    <span className="attachment-size">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      className="attachment-remove"
                      onClick={() => removeAttachment(index)}
                      aria-label="Remove attachment"
                    >
                      <Close size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>

            <button
              className="btn btn-accent"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner" /> Publishing
                </>
              ) : (
                <>
                  Publish post <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreatePost;