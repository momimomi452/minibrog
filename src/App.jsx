import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import "./App.css";


export default function App() {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [user, setUser] = useState(null);



useEffect(() => {
  loadPosts();

  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user);
  });

}, []);



const loadPosts = async () => {
  console.time("posts");

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  console.timeEnd("posts");

  console.log(data);

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
  console.log("ログイン成功", data.user);
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

  setImageFile(file);
};



const addPost = async () => {
  console.log("投稿ボタン押された");

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

  if (!text.trim() || !imageFile) {
    console.log("画像または文章が未入力");
    return;
  }

  const fileName = `${Date.now()}-${imageFile.name}`;

  const { error: uploadError } =
    await supabase.storage
      .from("blog-images")
      .upload(fileName, imageFile);

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  const { data: urlData } =
    supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);

  const imageUrl = urlData.publicUrl;

  console.log("imageUrl =", imageUrl);

  const { error } = await supabase
    .from("posts")
    .insert([
      {
        text,
        image_url: imageUrl,
      },
    ]);

  console.log("insert error", error);

  await loadPosts();

  setText("");
  setImageFile(null);
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


<div style={{ maxWidth: "500px", margin: "20px auto", padding: "20px" }}>




<h1 style={{ color: "orange" }}>
  毎日ミニブログ
</h1>


{user && (
  <button onClick={logout}>
    ログアウト
  </button>
)}



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


<h3>過去の記事</h3>

<ul>
  {posts.map((post) => (
    <li key={post.id}>
      {``}
        {new Date(post.created_at + "Z")
          .toLocaleDateString("ja-JP")}
        {"　 "}
        {post.text.slice(0, 31
        )}...

    </li>
  ))}
</ul>


      <hr />

      {posts.map((post) => (

<div
  key={post.id}
  id={`post-${post.id}`}
  className="card">



<p>
  {new Date(
    post.created_at + "Z"
  ).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}
</p>



<img
  src={post.image_url}
  alt=""
  style={{
    width: "100%",
    height: "auto",
    objectFit: "contain"
  }}
/>





 <div className="card-content">      

<p>{post.text}</p>


{user && (
<>



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

</>
)}

</div>

</div>

))}

</div>

</>
);
}