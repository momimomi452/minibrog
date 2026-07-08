import { useState, useEffect } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("posts");
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const addPost = () => {
    if (!text.trim() || !image) return;

    const post = {
      id: Date.now(),
      date: new Date().toLocaleDateString("ja-JP"),
      text: text.slice(0, 300),
      image,
    };

    setPosts([post, ...posts]);
    setText("");
    setImage("");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      <h1>毎日ミニブログ</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
      />

      <br /><br />

      <textarea
        value={text}
        maxLength={300}
        rows={5}
        style={{ width: "100%" }}
        onChange={(e) => setText(e.target.value)}
        placeholder="300文字以内で投稿..."
      />

      <p>{text.length}/300文字</p>

      <button onClick={addPost}>
        投稿する
      </button>

      <hr />

      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.date}</h3>

          <img
            src={post.image}
            alt=""
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover"
            }}
          />

          <p>{post.text}</p>

          <hr />
        </div>
      ))}
    </div>
  );
}