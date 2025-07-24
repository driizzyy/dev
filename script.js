document.addEventListener("DOMContentLoaded", () => {
  const username = "driizzyy";
  const repoContainer = document.getElementById("repo-list");
  const repoSelect = document.getElementById("chat-tool");
  const chatThread = document.getElementById("chat-thread");
  let ticketId = null;
  fetch(`https://api.github.com/users/${username}/repos?sort=updated`)
    .then(res => res.json())
    .then(repos => {
      repos.filter(r => !r.fork).slice(0, 10).forEach(repo => {
        // Repo card
        const card = document.createElement("div");
        card.className = "bg-black bg-opacity-30 p-6 rounded-xl shadow-lg transform transition hover:scale-105 hover:shadow-2xl";
        card.innerHTML = `
          <h3 class="text-xl font-semibold mb-2">${repo.name}</h3>
          <p class="text-gray-300 mb-3">${repo.description || "No description"}</p>
          <div class="text-sm text-gray-400 mb-2">Language: ${repo.language || "Unknown"} • ⭐ ${repo.stargazers_count}</div>
          <a href="${repo.html_url}" target="_blank" class="text-blue-400 hover:underline">View Repository</a>
        `;
        repoContainer.appendChild(card);
        const option = document.createElement("option");
        option.value = repo.name;
        option.textContent = repo.name;
        repoSelect.appendChild(option);
      });
    });
  document.getElementById("chat-button").addEventListener("click", () => {
    document.getElementById("chat-box").classList.toggle("hidden");
  });
  document.getElementById("send-chat").addEventListener("click", async () => {
    const user = document.getElementById("chat-username").value.trim();
    const tool = document.getElementById("chat-tool").value;
    const msg = document.getElementById("chat-message").value.trim();
    const status = document.getElementById("chat-status");
    if (!user || !tool || !msg) {
      status.textContent = "Please fill in all fields.";
      status.classList.remove("hidden", "text-green-400");
      status.classList.add("text-red-400");
      return;
    }
    const payload = {
      username: user,
      tool: tool,
      message: msg,
      ticketId: ticketId || undefined
    };
    try {
      const res = await fetch("http://localhost:3000/open-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      ticketId = data.ticketId;
      status.textContent = "✅ Message sent!";
      status.classList.remove("hidden", "text-red-400");
      status.classList.add("text-green-400");
      document.getElementById("chat-message").value = "";
    } catch (err) {
      status.textContent = "❌ Error sending message.";
      status.classList.remove("hidden", "text-green-400");
      status.classList.add("text-red-400");
    }
    setTimeout(() => status.classList.add("hidden"), 2500);
  });
  setInterval(async () => {
    if (!ticketId) return;
    try {
      const res = await fetch(`http://localhost:3000/ticket-messages/${ticketId}`);
      const messages = await res.json();
      chatThread.innerHTML = "";
      messages.forEach((msg) => {
        const bubble = document.createElement("div");
        bubble.className = msg.source === "discord"
          ? "text-right text-sm text-blue-300"
          : "text-left text-sm text-gray-300";
        bubble.innerText = `[${msg.username}]: ${msg.content}`;
        chatThread.appendChild(bubble);
      });
      chatThread.scrollTop = chatThread.scrollHeight;
    } catch (e) {
      console.warn("Polling failed.");
    }
  }, 3000);
});