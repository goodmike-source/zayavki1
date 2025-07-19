// Получаем DOM-элементы
const tableBody = document.getElementById("table-body");
const statusFilter = document.getElementById("status-filter");
const searchBox = document.getElementById("search-box");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const spanClose = document.querySelector(".close");

const defaultData = [
  {
    id: 1,
    date: "19.07.2025",
    client: "Иванов И.И.",
    product: "Шуруповёрт Deko",
    serviceId: "СЦ-001",
    status: "Принят",
    updateDate: "19.07.2025",
    comment: "Принят на складе",
    scAddress: "ул. Сервисная, 15",
    scPhone: "+79991112233",
    clientPhone: "+79998887766",
    manager: "Козяев В.С.",
    urgent: true,
    history: [],
    images: { product: "", serial: "", act: "" }
  }
];

function saveData(data) {
  localStorage.setItem("requestData", JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("requestData");
  return saved ? JSON.parse(saved) : defaultData;
}

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
    
      <td>${index + 1}</td>
      <td>${item.date}</td>
      <td>${item.client}</td>
      <td>${item.product}</td>
      <td>${item.serviceId}</td>
      <td class="status">${item.status}</td>
      <td>${item.updateDate}</td>
      <td>${item.comment}</td>
      <td>
        <select class="status-select">
          ${["Принят","Отправлен","На диагностике","Готов к выдаче","Требуется звонок","Отказано"]
            .map(s => `<option ${item.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <button class="update-btn">OK</button>
      </td>
      <td>
        <button class="details-btn">🔍</button>
        <button class="delete-btn">🗑️</button>
      </td>
    `;
    row.querySelector(".update-btn").onclick = () => {
      const newStatus = row.querySelector(".status-select").value;
      const now = new Date();
      item.status = newStatus;
      item.updateDate = now.toLocaleDateString("ru-RU");
      saveData(data);
      renderTable(filterData(data));
    };
    row.querySelector(".details-btn").onclick = () => openModal(item, data);
    row.querySelector(".delete-btn").onclick = () => {
      if (confirm("Удалить заявку?")) {
        data.splice(index, 1);
        saveData(data);
        renderTable(filterData(data));
      }
    };
    tableBody.appendChild(row);
  });
}

function openModal(item, data) {
  if (!item.history) item.history = [];
  if (!item.manager) item.manager = "";
  if (!item.urgent) item.urgent = false;
  if (!item.clientPhone) item.clientPhone = "";
  if (!item.scPhone) item.scPhone = "";

  modalBody.innerHTML = `
  <div class="modal-section">
    <h3>Основное</h3>
    <label>Клиент:<input value="${item.client}" id="edit-client" /></label>
    <label>Товар:<input value="${item.product}" id="edit-product" /></label>
    <label>Комментарий:<input value="${item.comment}" id="edit-comment" /></label>
    <label>Номер обращения:<input value="${item.serviceId}" id="edit-serviceId" /></label>
    <label>Ответственный менеджер:
      <select id="edit-manager">
        <option value="">-- Не выбран --</option>
        <option ${item.manager === "Козяев В.С." ? "selected" : ""}>Козяев В.С.</option>
        <option ${item.manager === "Сидоров" ? "selected" : ""}>Сидоров</option>
        <option ${item.manager === "Петрова" ? "selected" : ""}>Петрова</option>
      </select>
    </label>
    <label><input type="checkbox" id="edit-urgent" ${item.urgent ? "checked" : ""}/> Срочная заявка</label>
  </div>

  <div class="modal-section">
    <h3>Контакты</h3>
    <label>Адрес СЦ:<input value="${item.scAddress}" id="edit-scAddress" /></label>
    <label>Телефон СЦ:<input value="${item.scPhone}" id="edit-scPhone" /></label>
    <label>Телефон клиента:<input value="${item.clientPhone}" id="edit-clientPhone" /></label>
    ${item.clientPhone ? `<a href="tel:${item.clientPhone}" class="call-btn">📞 Позвонить</a>` : ""}
  </div>

  <div class="modal-section">
    <h3>Файлы</h3>
    <label>Фото товара: <input type="file" id="product-img" accept="image/*" /></label>
    <label>Фото серийника: <input type="file" id="serial-img" accept="image/*" /></label>
    <label>Фото акта: <input type="file" id="act-img" accept="image/*" /></label>
    <div class="image-preview">
      ${item.images.product ? `<img src="${item.images.product}" alt="Товар" />` : ""}
      ${item.images.serial ? `<img src="${item.images.serial}" alt="Серийник" />` : ""}
      ${item.images.act ? `<img src="${item.images.act}" alt="Акт" />` : ""}
    </div>
  </div>

  <div class="modal-section">
    <h3>История</h3>
    <ul class="history-list">
      ${item.history.map(h => `<li>${h}</li>`).join("") || "<li>Пока нет</li>"}
    </ul>
  </div>

  <div class="modal-actions">
    <button id="save-modal" class="primary-btn">💾 Сохранить</button>
  </div>
`;

  modal.style.display = "block";

  document.getElementById("save-modal").onclick = () => {
    const now = new Date().toLocaleString("ru-RU");

    const newData = {
      client: document.getElementById("edit-client").value,
      product: document.getElementById("edit-product").value,
      comment: document.getElementById("edit-comment").value,
      serviceId: document.getElementById("edit-serviceId").value,
      scAddress: document.getElementById("edit-scAddress").value,
      scPhone: document.getElementById("edit-scPhone").value,
      clientPhone: document.getElementById("edit-clientPhone").value,
      manager: document.getElementById("edit-manager").value,
      urgent: document.getElementById("edit-urgent").checked
    };

    for (let key in newData) {
      if (item[key] !== newData[key]) {
        item.history.push(`[${now}] Обновлено поле ${key}`);
        item[key] = newData[key];
      }
    }

    const readImage = (inputId, key) => {
      const fileInput = document.getElementById(inputId);
      if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = e => {
          item.images[key] = e.target.result;
          item.history.push(`[${now}] Заменено фото: ${key}`);
          finalize();
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        finalize();
      }
    };

    let loaded = 0;
    const finalize = () => {
      loaded++;
      if (loaded === 3) {
        saveData(data);
        renderTable(filterData(data));
        modal.style.display = "none";
      }
    };

    readImage("product-img", "product");
    readImage("serial-img", "serial");
    readImage("act-img", "act");
  };
}

spanClose.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

function filterData(data) {
  const statusVal = statusFilter.value;
  const searchText = searchBox.value.toLowerCase();
  return data.filter(item => {
    const matchesStatus = !statusVal || item.status === statusVal;
    const matchesSearch = item.client.toLowerCase().includes(searchText) || item.product.toLowerCase().includes(searchText);
    return matchesStatus && matchesSearch;
  });
}

statusFilter.onchange = () => renderTable(filterData(loadData()));
searchBox.oninput = () => renderTable(filterData(loadData()));
renderTable(filterData(loadData()));

// === ДОБАВЛЕНИЕ НОВОЙ ЗАЯВКИ ===
document.getElementById("add-request-btn").onclick = () => {
  const client = document.getElementById("new-client").value.trim();
  const product = document.getElementById("new-product").value.trim();
  const serviceId = document.getElementById("new-service-id").value.trim();
  const comment = document.getElementById("new-comment").value.trim();

  if (!client || !product) {
    alert("Заполните минимум поля Клиент и Товар.");
    return;
  }

  const data = loadData();
  const now = new Date().toLocaleDateString("ru-RU");
  const newId = data.length ? Math.max(...data.map(d => d.id)) + 1 : 1;

  const newItem = {
    id: newId,
    date: now,
    client,
    product,
    serviceId,
    status: "Принят",
    updateDate: now,
    comment,
    scAddress: "",
    scPhone: "",
    clientPhone: "",
    manager: "",
    urgent: false,
    history: [`[${now}] Заявка создана оператором`],
    images: { product: "", serial: "", act: "" }
  };

  data.push(newItem);
  saveData(data);
  renderTable(filterData(data));

  // Очистка формы
  document.getElementById("new-client").value = "";
  document.getElementById("new-product").value = "";
  document.getElementById("new-service-id").value = "";
  document.getElementById("new-comment").value = "";
};
