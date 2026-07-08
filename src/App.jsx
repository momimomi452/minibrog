import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import "./App.css";


export default function App() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [user, setUser] = useState(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user);
  });
}, []);



const loadPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (!error) {
    setPosts(data);
  }
};


const deletePost = async (id) => {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  console.log("delete error", error);

  loadPosts();
};


const login = async () => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  console.log("login data", data);
  console.log("login error", error);

  if (!error) {
    setUser(data.user);
  }
};




const logout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};


  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const addPost = async () => {

if (editingId) {

  const { data, error } = await supabase
    .from("posts")
    .update({
      text: text,
    })
    .eq("id", editingId)
    .select();

  console.log("update data", data);
  console.log("update error", error);

  await loadPosts();

  setEditingId(null);
  setText("");

  return;
}


    if (!text.trim() || !image) return;

    const post = {
      id: Date.now(),
      date: new Date().toLocaleDateString("ja-JP"),
      text: text.slice(0, 300),
      image,
    };

   const { data, error } = await supabase
  .from("posts")
  .insert([
    {
      text,
      image_url: image,
    },
  ]);

console.log("data", data);
console.log("error", error);

await loadPosts();


setText("");
setImage("");
  };

  return (
  <>

   {!user && (
      <div>

        <h2>管理者ログイン</h2>

        <input
          placeholder="メールアドレス"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <br /><br />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br /><br />

        <button onClick={login}>
          ログイン
        </button>

      </div>


    )}


<div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>




<h1>毎日ミニブログ</h1>

{user && (
<>

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
  {editingId ? "更新する" : "投稿する"}
</button>


</>

)}

      <hr />

      {posts.map((post) => (
        <div key={post.id}
  className="card">

          <p>
  {new Date(post.created_at)
    .toLocaleString("ja-JP")}
</p>

          <img
            src={post.image_url}
            alt=""
            style={{
  width: "100%",
  height: "450px",
  objectFit: "cover"
}}

          />

 <div className="card-content">      

<p>{post.text}</p>


<button
  onClick={() => {
    setText(post.text);
    setEditingId(post.id);
  }}
>
  編集
</button>


<button
  onClick={() => deletePost(post.id)}
>
  削除
</button>

</div>

</div>

))}

</div>

</>
);
}