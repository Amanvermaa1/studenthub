import { notify } from "../components/Toast.jsx";

async function sharePostLink(post) {
  const url = `${window.location.origin}/post/${post.id}`;

  try {
    await navigator.clipboard.writeText(url);
    notify("Link copied to clipboard.");
  } catch (error) {
    console.error(error);

    const field = document.createElement("textarea");
    field.value = url;
    document.body.appendChild(field);
    field.select();

    try {
      document.execCommand("copy");
      notify("Link copied to clipboard.");
    } catch (fallbackError) {
      console.error(fallbackError);
      notify("Could not copy the link.", "error");
    }

    document.body.removeChild(field);
  }
}

export { sharePostLink };