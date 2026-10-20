import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "../Icons.jsx";
import { API } from "../api/client.js";
import { notify } from "../components/Toast.jsx";

/* =====================================================
   EDIT POST
   ===================================================== */

function EditPost({ token, fetchMyPosts, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${API}/posts/${id}`);
        if (!response.ok) {
          if (!cancelled) setFailed(true);
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          setPost(data);
          setTitle(data.title || "");
          setContent(data.content || "");
          setSubject(data.subject || "");
          // ownership check
          if (user && data.user_id && data.user_id !== user.id) {
            setFailed(true);
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, user]);

  if (loading) {
    return (
      <main className="form-page">
        <div className="form-card">
          <section className="page-header">
            <div>
              <span className="eyebrow-plain">Editing</span>
              <h1>Update your post</h1>
            </div>
          </section>
          <div className="skeleton skeleton-line w40" style={{margin: '2rem auto', maxWidth: '400px'}} />
        </div>
      </main>
    );
  }

  if (failed || !post) {
    return (
      <main className="form-page">
        <div className="form-card">
          <section className="page-header">
            <div>
              <span className="eyebrow-plain">Editing</span>
              <h1>Post not found</h1>
            </div>
          </section>
          <p>This post doesn't exist or you don't have permission to edit it.</p>
          <button className="btn btn-accent" onClick={() => navigate("/my-posts")}>
            <ArrowRight size={16} /> Back to my posts
          </button>
        </div>
      </main>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);

    try {
      const response = await fetch(`${API}/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, subject }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.message || "Could not update the post.", "error");
        setBusy(false);
        return;
      }

      notify("Changes saved.");
      fetchMyPosts();
      navigate("/my-posts");
    } catch (error) {
      console.error(error);
      notify("Could not reach the server. Try again.", "error");
      setBusy(false);
    }
  };

  return (
    <main className="form-page">
      <div className="form-card">
        <section className="page-header">
          <div>
            <span className="eyebrow-plain">Editing</span>
            <h1>Update your post</h1>
            <p>Refresh the details so the post stays useful.</p>
          </div>
        </section>

        <form onSubmit={submit}>
          <div className="field-block">
            <label className="label" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="field-block">
            <label className="label" htmlFor="edit-subject">
              Subject
            </label>
            <select
              id="edit-subject"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            >
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
            <label className="label" htmlFor="edit-content">
              Content
            </label>
            <textarea
              id="edit-content"
              className="input"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/my-posts")}
            >
              Cancel
            </button>

            <button className="btn btn-accent" type="submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="spinner" /> Saving
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditPost;
