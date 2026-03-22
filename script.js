let members = [];
let currentMemberId = null;

function loadMembers() {
  const data = localStorage.getItem('members');
  return data ? JSON.parse(data) : [];
}

function saveMembers(membersData) {
  localStorage.setItem('members', JSON.stringify(membersData));
}

function renderMembers(membersData) {
  const memberList = document.getElementById('member-list');
  
  if (membersData.length === 0) {
    memberList.innerHTML = '<div class="empty-message">회원이 없습니다</div>';
    return;
  }

  memberList.innerHTML = membersData.map(member => {
    const isActive = member.id === currentMemberId ? 'active' : '';
    const isUnpaid = member.payment.status === '미납';
    const hasBooks = member.booksRead.length > 0;
    
    return `
      <div class="member-card ${isActive}" data-id="${member.id}">
        <div class="member-card-header">
          <span class="member-card-name">${member.name}</span>
          ${isUnpaid ? '<span class="badge badge-unpaid">미납</span>' : ''}
        </div>
        <div class="member-card-info">
          <span>${member.grade}</span>
          <span>${member.phone}</span>
        </div>
        <div class="member-card-badges">
          <span class="badge badge-level">레벨 ${member.level}</span>
          <span class="badge badge-grade">${member.grade}</span>
          ${hasBooks ? `<span class="badge">독서 ${member.booksRead.length}권</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderMemberDetail(member) {
  const detailContent = document.getElementById('detail-content');
  
  const attendanceRate = calculateAttendanceRate(member.attendance);
  
  detailContent.innerHTML = `
    <div class="detail-header">
      <div class="detail-header-info">
        <h2>${member.name}</h2>
        <p>${member.grade} | ${member.phone} | 레벨 ${member.level}</p>
      </div>
      <div class="detail-header-actions">
        <button class="btn btn-danger" onclick="deleteMember(${member.id})">회원 삭제</button>
      </div>
    </div>

    <div class="detail-stats">
      <div class="stat-card">
        <div class="stat-card-label">출석률</div>
        <div class="stat-card-value">${attendanceRate}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">독서 권수</div>
        <div class="stat-card-value">${member.booksRead.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">상담 횟수</div>
        <div class="stat-card-value">${member.counseling.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">결제 상태</div>
        <div class="stat-card-value ${member.payment.status === '완료' ? 'payment-status-paid' : 'payment-status-unpaid'}">
          ${member.payment.status}
        </div>
      </div>
    </div>

    <div class="detail-sections">
      <div class="section-card">
        <div class="section-header">출결 관리</div>
        <div class="section-body">
          <form class="section-form" onsubmit="addAttendance(event, ${member.id})">
            <input type="date" id="attendance-date" required>
            <select id="attendance-status" required>
              <option value="출석">출석</option>
              <option value="지각">지각</option>
              <option value="결석">결석</option>
            </select>
            <button type="submit">추가</button>
          </form>
          <div class="record-list">
            ${member.attendance.map((record, index) => `
              <div class="record-item">
                <div class="record-info">
                  <div class="record-date">${record.date}</div>
                  <div class="record-content status-${getStatusClass(record.status)}">${record.status}</div>
                </div>
                <div class="record-actions">
                  <button class="btn btn-danger" onclick="deleteAttendance(${member.id}, ${index})">삭제</button>
                </div>
              </div>
            `).join('')}
            ${member.attendance.length === 0 ? '<div class="empty-message">출결 기록이 없습니다</div>' : ''}
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">독서 관리</div>
        <div class="section-body">
          <form class="section-form" onsubmit="addBook(event, ${member.id})">
            <input type="text" id="book-title" placeholder="책 제목" required>
            <input type="date" id="book-date" required>
            <select id="book-comprehension" required>
              <option value="잘 이해함">잘 이해함</option>
              <option value="보통">보통</option>
              <option value="어려움">어려움</option>
            </select>
            <input type="text" id="book-memo" placeholder="메모">
            <button type="submit">추가</button>
          </form>
          <div class="record-list">
            ${member.booksRead.map((record, index) => `
              <div class="record-item">
                <div class="record-info">
                  <div class="record-date">${record.date}</div>
                  <div class="record-content">${record.title}</div>
                  <div class="record-content comprehension-${getComprehensionClass(record.comprehension)}">${record.comprehension}</div>
                  ${record.memo ? `<div class="record-date">${record.memo}</div>` : ''}
                </div>
                <div class="record-actions">
                  <button class="btn btn-danger" onclick="deleteBook(${member.id}, ${index})">삭제</button>
                </div>
              </div>
            `).join('')}
            ${member.booksRead.length === 0 ? '<div class="empty-message">독서 기록이 없습니다</div>' : ''}
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">상담 기록</div>
        <div class="section-body">
          <form class="section-form" onsubmit="addCounseling(event, ${member.id})">
            <input type="date" id="counseling-date" required>
            <input type="text" id="counseling-content" placeholder="상담 내용" required style="flex: 2;">
            <button type="submit">추가</button>
          </form>
          <div class="record-list">
            ${member.counseling.map((record, index) => `
              <div class="record-item">
                <div class="record-info">
                  <div class="record-date">${record.date}</div>
                  <div class="record-content">${record.content}</div>
                </div>
                <div class="record-actions">
                  <button class="btn btn-danger" onclick="deleteCounseling(${member.id}, ${index})">삭제</button>
                </div>
              </div>
            `).join('')}
            ${member.counseling.length === 0 ? '<div class="empty-message">상담 기록이 없습니다</div>' : ''}
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">결제 관리</div>
        <div class="section-body">
          <form class="section-form" onsubmit="updatePayment(event, ${member.id})">
            <select id="payment-status" required>
              <option value="완료">완료</option>
              <option value="미납">미납</option>
            </select>
            <input type="number" id="payment-amount" placeholder="금액" required>
            <input type="date" id="payment-date" required>
            <button type="submit">저장</button>
          </form>
          <div class="record-item">
            <div class="record-info">
              <div class="record-content">상태: <span class="${member.payment.status === '완료' ? 'payment-status-paid' : 'payment-status-unpaid'}">${member.payment.status}</span></div>
              <div class="record-date">금액: ${member.payment.amount.toLocaleString()}원</div>
              <div class="record-date">마지막 납부일: ${member.payment.lastPaid || '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getStatusClass(status) {
  switch (status) {
    case '출석': return 'present';
    case '결석': return 'absent';
    case '지각': return 'late';
    default: return '';
  }
}

function getComprehensionClass(comprehension) {
  switch (comprehension) {
    case '잘 이해함': return 'easy';
    case '보통': return 'medium';
    case '어려움': return 'hard';
    default: return '';
  }
}

function calculateAttendanceRate(attendance) {
  if (attendance.length === 0) return 0;
  
  let total = 0;
  attendance.forEach(record => {
    if (record.status === '출석') total += 1;
    else if (record.status === '지각') total += 0.5;
  });
  
  return Math.round((total / attendance.length) * 100);
}

function addMember(e) {
  e.preventDefault();
  
  const name = document.getElementById('reg-name').value;
  const grade = document.getElementById('reg-grade').value;
  const phone = document.getElementById('reg-phone').value;
  const level = parseInt(document.getElementById('reg-level').value);
  
  const newMember = {
    id: Date.now(),
    name,
    grade,
    phone,
    level,
    attendance: [],
    booksRead: [],
    counseling: [],
    payment: {
      status: '미납',
      amount: 0,
      lastPaid: ''
    },
    createdAt: new Date().toISOString()
  };
  
  members.push(newMember);
  saveMembers(members);
  applyFilters();
  
  e.target.reset();
}

function deleteMember(id) {
  if (!confirm('정말로 이 회원을 삭제하시겠습니까?')) return;
  
  members = members.filter(m => m.id !== id);
  
  if (currentMemberId === id) {
    currentMemberId = null;
    document.getElementById('detail-content').innerHTML = '<div class="empty-detail">회원을 선택하세요</div>';
  }
  
  saveMembers(members);
  applyFilters();
}

function addAttendance(e, memberId) {
  e.preventDefault();
  
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  const date = document.getElementById('attendance-date').value;
  const status = document.getElementById('attendance-status').value;
  
  member.attendance.push({ date, status });
  
  saveMembers(members);
  renderMemberDetail(member);
  applyFilters();
  
  e.target.reset();
}

function deleteAttendance(memberId, index) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  member.attendance.splice(index, 1);
  
  saveMembers(members);
  renderMemberDetail(member);
  applyFilters();
}

function addBook(e, memberId) {
  e.preventDefault();
  
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  const title = document.getElementById('book-title').value;
  const date = document.getElementById('book-date').value;
  const comprehension = document.getElementById('book-comprehension').value;
  const memo = document.getElementById('book-memo').value;
  
  member.booksRead.push({ title, date, comprehension, memo });
  
  saveMembers(members);
  renderMemberDetail(member);
  applyFilters();
  
  e.target.reset();
}

function deleteBook(memberId, index) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  member.booksRead.splice(index, 1);
  
  saveMembers(members);
  renderMemberDetail(member);
  applyFilters();
}

function addCounseling(e, memberId) {
  e.preventDefault();
  
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  const date = document.getElementById('counseling-date').value;
  const content = document.getElementById('counseling-content').value;
  
  member.counseling.push({ date, content });
  
  saveMembers(members);
  renderMemberDetail(member);
  
  e.target.reset();
}

function deleteCounseling(memberId, index) {
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  member.counseling.splice(index, 1);
  
  saveMembers(members);
  renderMemberDetail(member);
}

function updatePayment(e, memberId) {
  e.preventDefault();
  
  const member = members.find(m => m.id === memberId);
  if (!member) return;
  
  const status = document.getElementById('payment-status').value;
  const amount = parseInt(document.getElementById('payment-amount').value);
  const lastPaid = document.getElementById('payment-date').value;
  
  member.payment = { status, amount, lastPaid };
  
  saveMembers(members);
  renderMemberDetail(member);
  applyFilters();
}

function checkPaymentStatus() {
  const now = new Date();
  
  members.forEach(member => {
    if (member.payment.lastPaid) {
      const lastPaid = new Date(member.payment.lastPaid);
      const diffDays = (now - lastPaid) / (1000 * 60 * 60 * 24);
      
      if (diffDays > 30) {
        member.payment.status = '미납';
      }
    }
  });
}

function upgradeGrade(grade) {
  const num = parseInt(grade.replace(/[^0-9]/g, ""));

  if (grade.includes("초")) {
    if (num < 6) return "초" + (num + 1);
    return "중1";
  }

  if (grade.includes("중")) {
    if (num < 3) return "중" + (num + 1);
    return "고1";
  }

  if (grade.includes("고")) {
    if (num < 3) return "고" + (num + 1);
    return grade;
  }

  return grade;
}

function autoUpgradeGrades(membersData) {
  const now = new Date();

  membersData.forEach(member => {
    const created = new Date(member.createdAt);
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);

    if (diffDays >= 365) {
      member.grade = upgradeGrade(member.grade);
      member.createdAt = now.toISOString();
    }
  });
}

function applyFilters() {
  let filteredMembers = [...members];
  
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const filterLevel = document.getElementById('filter-level').value;
  const filterGrade = document.getElementById('filter-grade').value;
  const filterUnpaid = document.getElementById('filter-unpaid').checked;
  const filterNoBooks = document.getElementById('filter-no-books').checked;
  const filterLowComprehension = document.getElementById('filter-low-comprehension').checked;
  
  if (searchTerm) {
    filteredMembers = filteredMembers.filter(m => 
      m.name.toLowerCase().includes(searchTerm) || 
      m.phone.includes(searchTerm)
    );
  }
  
  if (filterLevel) {
    filteredMembers = filteredMembers.filter(m => m.level === parseInt(filterLevel));
  }
  
  if (filterGrade) {
    filteredMembers = filteredMembers.filter(m => m.grade === filterGrade);
  }
  
  if (filterUnpaid) {
    filteredMembers = filteredMembers.filter(m => m.payment.status === '미납');
  }
  
  if (filterNoBooks) {
    filteredMembers = filteredMembers.filter(m => m.booksRead.length === 0);
  }
  
  if (filterLowComprehension) {
    filteredMembers = filteredMembers.filter(m => 
      m.booksRead.some(b => b.comprehension === '어려움')
    );
  }
  
  renderMembers(filteredMembers);
}

function selectMember(e) {
  const card = e.target.closest('.member-card');
  if (!card) return;
  
  const memberId = parseInt(card.dataset.id);
  currentMemberId = memberId;
  
  const member = members.find(m => m.id === memberId);
  if (member) {
    renderMemberDetail(member);
    applyFilters();
  }
}

function renderDashboard() {
  document.getElementById('stat-total-members').textContent = members.length;
  
  const totalAttendance = members.reduce((sum, m) => sum + calculateAttendanceRate(m.attendance), 0);
  const avgAttendance = members.length > 0 ? Math.round(totalAttendance / members.length) : 0;
  document.getElementById('stat-avg-attendance').textContent = avgAttendance + '%';
  
  const unpaidCount = members.filter(m => m.payment.status === '미납').length;
  document.getElementById('stat-unpaid').textContent = unpaidCount;
  
  const totalBooks = members.reduce((sum, m) => sum + m.booksRead.length, 0);
  document.getElementById('stat-total-books').textContent = totalBooks;
  
  renderLevelChart();
  renderGradeChart();
  renderRecentCounseling();
}

function renderLevelChart() {
  const levelCounts = {};
  for (let i = 1; i <= 9; i++) {
    levelCounts[i] = 0;
  }
  
  members.forEach(m => {
    if (levelCounts[m.level] !== undefined) {
      levelCounts[m.level]++;
    }
  });
  
  const maxCount = Math.max(...Object.values(levelCounts), 1);
  
  const chartContainer = document.getElementById('level-chart');
  chartContainer.innerHTML = Object.entries(levelCounts).map(([level, count]) => {
    const percentage = (count / maxCount) * 100;
    return `
      <div class="chart-bar">
        <span class="chart-label">레벨 ${level}</span>
        <div class="chart-bar-fill" style="width: ${percentage}%">${count}명</div>
      </div>
    `;
  }).join('');
}

function renderGradeChart() {
  const gradeCounts = {
    '초1': 0, '초2': 0, '초3': 0, '초4': 0, '초5': 0, '초6': 0,
    '중1': 0, '중2': 0, '중3': 0,
    '고1': 0, '고2': 0, '고3': 0
  };
  
  members.forEach(m => {
    if (gradeCounts[m.grade] !== undefined) {
      gradeCounts[m.grade]++;
    }
  });
  
  const maxCount = Math.max(...Object.values(gradeCounts), 1);
  
  const chartContainer = document.getElementById('grade-chart');
  chartContainer.innerHTML = Object.entries(gradeCounts)
    .filter(([_, count]) => count > 0)
    .map(([grade, count]) => {
      const percentage = (count / maxCount) * 100;
      return `
        <div class="chart-bar">
          <span class="chart-label">${grade}</span>
          <div class="chart-bar-fill" style="width: ${percentage}%">${count}명</div>
        </div>
      `;
    }).join('') || '<div class="empty-message">데이터가 없습니다</div>';
}

function renderRecentCounseling() {
  const allCounseling = [];
  
  members.forEach(m => {
    m.counseling.forEach(c => {
      allCounseling.push({
        memberName: m.name,
        date: c.date,
        content: c.content
      });
    });
  });
  
  allCounseling.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const recentCounseling = allCounseling.slice(0, 5);
  
  const container = document.getElementById('recent-counseling');
  if (recentCounseling.length === 0) {
    container.innerHTML = '<div class="empty-message">상담 기록이 없습니다</div>';
    return;
  }
  
  container.innerHTML = recentCounseling.map(c => `
    <div class="recent-item">
      <span class="recent-member">${c.memberName}</span>
      <span class="recent-date">${c.date}</span>
      <span class="recent-content">${c.content}</span>
    </div>
  `).join('');
}

function toggleDashboard() {
  const dashboardSection = document.getElementById('dashboard-section');
  const isVisible = dashboardSection.style.display !== 'none';
  
  dashboardSection.style.display = isVisible ? 'none' : 'block';
  
  if (!isVisible) {
    renderDashboard();
  }
}

function init() {
  members = loadMembers();
  
  autoUpgradeGrades(members);
  checkPaymentStatus();
  
  saveMembers(members);
  applyFilters();
  
  document.getElementById('register-form').addEventListener('submit', addMember);
  
  document.getElementById('search-input').addEventListener('input', applyFilters);
  document.getElementById('filter-level').addEventListener('change', applyFilters);
  document.getElementById('filter-grade').addEventListener('change', applyFilters);
  document.getElementById('filter-unpaid').addEventListener('change', applyFilters);
  document.getElementById('filter-no-books').addEventListener('change', applyFilters);
  document.getElementById('filter-low-comprehension').addEventListener('change', applyFilters);
  
  document.getElementById('member-list').addEventListener('click', selectMember);
  
  document.getElementById('toggle-dashboard').addEventListener('click', toggleDashboard);
}

document.addEventListener('DOMContentLoaded', init);
