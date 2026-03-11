# 3D Interview Avatar (GLB or VRM)

The interview simulator shows a 3D avatar in the interviewer slot. It loads **`model.glb`** by default from this folder (`public/model.glb`). You can also use **`avatar.vrm`** (VRM format). If no model is available, you’ll see “Avatar unavailable.”

**For a clear “interviewer” look:** use a **humanoid VRM with a visible face** (e.g. from Ready Player Me or VRoid Studio). The app shows the front of the model and frames the head; non-human or headless models will still appear as-is.

---

## Option 1: Run the download script (quick)

From the **project root** (the folder that contains `package.json`):

```bash
node scripts/download-avatar-vrm.js
```

If it succeeds, you’ll have `public/avatar.vrm`. Refresh the interview page and the avatar should appear. If the script fails (e.g. 404), use Option 2.

---

## Option 2: Add your own VRM file (recommended if script fails)

### Step 1: Get a VRM file

**Ready Player Me (easiest):**

1. Open **[readyplayer.me](https://readyplayer.me)** in your browser.
2. Click **“Create avatar”** and design your character (or use a preset).
3. When done, use **Export** or **Download** and choose **VRM**.
4. Save the file (e.g. `my-avatar.vrm`).

**Other options:** VRoid Studio, or any tool that exports `.vrm` (VRM 0.x or 1.0).

### Step 2: Put it in the project

- **GLB/GLTF:** Save as **`model.glb`** in **`public/`** — this is the default. The app loads `/model.glb` automatically.
- **VRM:** Save as **`avatar.vrm`** in **`public/`**, then use the avatar with `modelUrl="/avatar.vrm"` (see below).

### Step 3: Reload the app

Refresh the interview page. The app loads **`/model.glb`** by default.

---

**Using a different file:**  
Put the file in `public/` (e.g. `my-avatar.glb` or `my-avatar.vrm`), then pass `modelUrl="/my-avatar.glb"` (or `.vrm`) to the `InterviewAvatarVrm` component.

---

## Room / office background

The avatar is shown in front of a **bookshelf-style** background by default. To use your own room, office, or library image instead, add **`avatar-bg.jpg`** or **`avatar-bg.png`** to `public/`. The app will use it automatically; if neither file exists, the built-in bookshelf background is shown.
