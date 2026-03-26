const Admin = {
  data: {},
  activeSection: 'overview',
  config: {
    overview: {
      label: 'Status', icon: '📊',
      render: (panel) => {
        panel.innerHTML = `
          <div class="glass-card" style="padding:48px;text-align:center">
            <h2 class="grad-text" style="font-size:2rem;margin-bottom:16px">Neural Status: ONLINE</h2>
            <p style="color:var(--ink-dim);max-width:500px;margin:0 auto 32px">The Class 10Edu OS is operating within normal parameters. Neural pathways are synced, and the learning nexus is stable.</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
              <div class="glass-card" style="padding:24px;border-color:var(--accent-1)">
                <div style="font-size:2rem;margin-bottom:8px">🧠</div>
                <div style="font-weight:800">COGNITION</div>
                <div style="color:var(--ink-dim)">98.4%</div>
              </div>
              <div class="glass-card" style="padding:24px;border-color:var(--accent-2)">
                <div style="font-size:2rem;margin-bottom:8px">⚡</div>
                <div style="font-weight:800">LATENCY</div>
                <div style="color:var(--ink-dim)">12ms</div>
              </div>
              <div class="glass-card" style="padding:24px;border-color:var(--accent-3)">
                <div style="font-size:2rem;margin-bottom:8px">🛡️</div>
                <div style="font-weight:800">SECURITY</div>
                <div style="color:var(--ink-dim)">ACTIVE</div>
              </div>
            </div>
          </div>
        `;
      }
    },
    subjects: {
      label: 'Subjects', icon: '�',
      fields: [
        { name: 'id', label: 'ID', type: 'text', required: true },
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'icon', label: 'Icon', type: 'text' },
        { name: 'color', label: 'Color', type: 'color' },
      ],
      columns: ['name', 'id', 'icon']
    },
    teachers: {
      label: 'Teachers', icon: '👨‍🏫',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'channel', label: 'Channel', type: 'text' },
      ],
      columns: ['name', 'channel']
    },
  },

  init() {
    if (!this.checkLogin()) return;
    this.loadData().then(() => {
      this.renderNav();
      this.renderPanels();
      this.switchSection(this.activeSection);
    });
  },

  renderNav() {
    const navEl = document.getElementById('adminNavLinks');
    let html = '';
    for (const sectionId in this.config) {
      const section = this.config[sectionId];
      html += `<div class="sb-link" id="al-${sectionId}" onclick="Admin.switchSection('${sectionId}')" style="cursor:pointer">${section.icon} ${section.label}</div>`;
    }
    navEl.innerHTML = html;
  },

  renderPanels() {
    const panelsEl = document.getElementById('adminPanels');
    let html = '';
    for (const sectionId in this.config) {
      html += `<div class="a-panel" id="ap-${sectionId}"></div>`;
    }
    panelsEl.innerHTML = html;
  },

  switchSection(sectionId) {
    this.activeSection = sectionId;
    document.querySelectorAll('.sb-link').forEach(el => el.classList.remove('on'));
    const link = document.getElementById(`al-${sectionId}`);
    if (link) link.classList.add('on');

    document.querySelectorAll('.a-panel').forEach(el => el.classList.remove('on'));
    const panel = document.getElementById(`ap-${sectionId}`);
    panel.classList.add('on');

    const section = this.config[sectionId];
    if (section.render) {
      section.render(panel);
    } else {
      this.renderGenericPanel(panel, sectionId, section);
    }
    App.initTilt();
  },

  renderGenericPanel(panel, sectionId, section) {
    panel.innerHTML = `
      <div class="glass-card" style="margin-bottom:32px">
        <h3 style="margin-bottom:24px">Provision: ${section.label}</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
          ${section.fields.map(f => `
            <div class="fg">
              <label style="font-size:0.65rem;font-weight:800;color:var(--ink-dim);text-transform:uppercase">${f.label}</label>
              <input type="${f.type || 'text'}" class="todo-inp" id="new-${sectionId}-${f.name}" placeholder="${f.label}">
            </div>
          `).join('')}
        </div>
        <button class="btn-glow" style="margin-top:24px" onclick="Admin.addItem('${sectionId}')">Execute Provision</button>
      </div>

      <div class="glass-card" style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="text-align:left;font-size:0.7rem;font-weight:800;color:var(--ink-dim);text-transform:uppercase">
              ${section.columns.map(c => `<th style="padding:16px">${c}</th>`).join('')}
              <th style="padding:16px">Operation</th>
            </tr>
          </thead>
          <tbody>
            ${(this.data[sectionId] || []).map((item, index) => `
              <tr style="border-top:1px solid var(--glass-border)">
                ${section.columns.map(c => `<td style="padding:16px">${VidyaSec.sanitize(item[c] || '')}</td>`).join('')}
                <td style="padding:16px"><button class="btn-glow" style="padding:8px 16px;font-size:0.75rem;background:rgba(239,68,68,0.2);box-shadow:none" onclick="Admin.deleteItem('${sectionId}', ${index})">De-Provision</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  addItem(sectionId) {
    const section = this.config[sectionId];
    const newItem = {};
    let isValid = true;
    section.fields.forEach(f => {
      const input = document.getElementById(`new-${sectionId}-${f.name}`);
      if (input) {
        newItem[f.name] = input.value;
        if (f.required && !input.value) { isValid = false; alert(`${f.label} required`); }
      }
    });

    if (isValid) {
      if (!this.data[sectionId]) this.data[sectionId] = [];
      this.data[sectionId].push(newItem);
      this.saveData();
      this.switchSection(sectionId);
    }
  },

  deleteItem(sectionId, index) {
    if (confirm('Initiate de-provisioning?')) {
      this.data[sectionId].splice(index, 1);
      this.saveData();
      this.switchSection(sectionId);
    }
  },

  checkLogin() {
    const key = localStorage.getItem('vm_admin_key');
    if (key === '6610') {
      document.getElementById('loginWall').style.display = 'none';
      document.getElementById('adminBody').style.display = 'block';
      return true;
    }
    return false;
  },

  tryLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === '6610') {
      localStorage.setItem('vm_admin_key', pass);
      this.init();
    } else {
      document.getElementById('loginErr').textContent = 'Unauthorized Key';
    }
  },

  logout() {
    localStorage.removeItem('vm_admin_key');
    window.location.reload();
  },

  async loadData() {
    try {
      const response = await fetch('js/data.json');
      const builtInData = await response.json();
      const adminData = JSON.parse(localStorage.getItem('vm_admin_data') || '{}');
      this.data = { ...builtInData, ...adminData };
    } catch (e) {
      this.data = JSON.parse(localStorage.getItem('vm_admin_data') || '{}');
    }
  },

  saveData() {
    localStorage.setItem('vm_admin_data', JSON.stringify(this.data));
  },
};
