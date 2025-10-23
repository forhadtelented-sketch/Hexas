// ========== MOCK DATA / LOCAL STORAGE UTILS ==========
function initMockData() {
  if (!localStorage.getItem('isInitialized')) {
    localStorage.setItem('users', JSON.stringify([
      { id: 'u1', username: 'admin', password: 'password', role: 'admin' },
      { id: 'u2', username: 'teacher', password: 'password', role: 'teacher' },
      { id: 'u3', username: 'student', password: 'password', role: 'student' }
    ]));
    localStorage.setItem('teachers', JSON.stringify([
      { id: 't1', name: 'John Doe', phone: '123-456-7890' },
      { id: 't2', name: 'Jane Smith', phone: '098-765-4321' }
    ]));
    localStorage.setItem('courses', JSON.stringify([
      { id: 'c1', name: 'IELTS Preparation', description: 'Comprehensive course for IELTS exam.' },
      { id: 'c2', name: 'Spoken English', description: 'Improve your speaking fluency.' }
    ]));
    localStorage.setItem('timeframes', JSON.stringify([
      { id: 'tf1', start: '09:00', end: '10:30' },
      { id: 'tf2', start: '11:00', end: '12:30' },
      { id: 'tf3', start: '14:00', end: '15:30' }
    ]));
    localStorage.setItem('rooms', JSON.stringify([
      { id: 'r1', name: 'Room 101' },
      { id: 'r2', name: 'Room 102' }
    ]));
    localStorage.setItem('batches', JSON.stringify([]));
    localStorage.setItem('testSlots', JSON.stringify([]));
    localStorage.setItem('testRegistrations', JSON.stringify([]));
    localStorage.setItem('students', JSON.stringify([])); // Students registered for tests will go here
    localStorage.setItem('attendance', JSON.stringify([])); // Attendance records
    localStorage.setItem('performance', JSON.stringify([])); // Performance records
    localStorage.setItem('speakingDaySettings', JSON.stringify([])); // Speaking Day availability

    localStorage.setItem('isInitialized', 'true');
  }
}

function generateUniqueId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `${message} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  alertContainer.appendChild(alertDiv);

  setTimeout(() => {
    // Check if the alertDiv still exists in the DOM before attempting to remove it
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 5000); // Alert disappears after 5 seconds
}

function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes; // Return minutes since midnight
}

// ========== AUTHENTICATION ==========
let currentUser = null;

function loginUser() {
  const usernameInput = document.getElementById('username').value;
  const passwordInput = document.getElementById('password').value;
  const roleSelect = document.getElementById('roleSelect').value;

  const users = getData('users');
  const user = users.find(u => u.username === usernameInput && u.password === passwordInput && u.role === roleSelect);

  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showAlert(`Welcome, ${user.role}!`, 'success');
    updateNavbarForAuth();
    goToDashboard();
  } else {
    showAlert('Invalid username, password, or role.', 'danger');
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showAlert('Logged out successfully.', 'info');
  updateNavbarForAuth();
  showPage('loginPage');
}

function checkInitialPageLoad() {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    updateNavbarForAuth();
    goToDashboard();
  } else {
    showPage('loginPage');
  }
}

function showPage(pageId) {
  const pages = document.querySelectorAll('.page-content');
  pages.forEach(page => page.classList.add('d-none')); // Hide all pages

  document.getElementById(pageId)?.classList.remove('d-none'); // Show the requested page

  // Handle specific page loads
  if (pageId === 'teachers') {
    loadTeachers();
  } else if (pageId === 'courses') {
    loadCourses();
  } else if (pageId === 'timeAndPlace') {
    loadTimeframes();
    loadRooms();
  } else if (pageId === 'batches') {
    populateBatchForms();
    loadBatches();
    resetBatchForm(); // Ensure form is clear on load
  } else if (pageId === 'dashboard') {
    loadDashboard();
  } else if (pageId === 'testManagement') {
    showMockTest(); // Default to mock test setup
    loadTestSlots();
    populateMockSpeakingBatchesDropdown(); // New function
    renderSpeakingSlotBatches(); 
  } else if (pageId === 'testRegister') {
    loadTestSlots('mock'); // Load mock test slots by default
    document.getElementById('registerModuleSelect').value = ""; // Reset module select
    hideRegistrationForm();
    loadTestRegistrations();
  } else if (pageId === 'studentRecords') {
    loadStudents();
  } else if (pageId === 'attendance') {
    populateAttendanceBatches();
    document.getElementById('attendanceList').innerHTML = ''; // Clear previous attendance
  } else if (pageId === 'performance') {
    populatePerformanceStudents();
    document.getElementById('performanceContent').innerHTML = ''; // Clear previous performance
  }
}

function goToDashboard() {
  if (currentUser) {
    if (currentUser.role === 'admin') {
      showPage('adminDashboard');
    } else if (currentUser.role === 'teacher') {
      showPage('teacherDashboard');
    } else if (currentUser.role === 'student') {
      showPage('studentDashboard');
    } else {
      showPage('home'); // Fallback for other roles or issues
    }
  } else {
    showPage('loginPage');
  }
}

function showSpeakingTest() {
  document.getElementById('speakingTestTimeframeContainer').classList.add('d-none');
}

function showMockTest() {
  document.getElementById('speakingTestTimeframeContainer').classList.remove('d-none');
}

function showIndividualModuleTest() {
  document.getElementById('speakingTestTimeframeContainer').classList.remove('d-none');
}

function updateNavbarForAuth() {
  const loginNavItem = document.getElementById('loginNavItem');
  const logoutNavItem = document.getElementById('logoutNavItem');
  const dashboardNavItem = document.getElementById('dashboardNavItem');

  const schedulingNavLink = document.getElementById('schedulingNavLink');
  const testNavLink = document.getElementById('testNavLink');
  const studentInfoNavLink = document.getElementById('studentInfoNavLink');

  if (currentUser) {
    loginNavItem.classList.add('d-none');
    logoutNavItem.classList.remove('d-none');
    dashboardNavItem.classList.remove('d-none');

    // Show/hide navigation links based on role
    schedulingNavLink.classList.add('d-none');
    testNavLink.classList.add('d-none');
    studentInfoNavLink.classList.add('d-none');

    if (currentUser.role === 'admin') {
      schedulingNavLink.classList.remove('d-none');
      testNavLink.classList.remove('d-none');
      studentInfoNavLink.classList.remove('d-none');
    } else if (currentUser.role === 'teacher') {
      // Teachers might see parts of scheduling and test, but not all management
      schedulingNavLink.classList.remove('d-none'); // For dashboard view
      testNavLink.classList.remove('d-none'); // For entering results
      studentInfoNavLink.classList.remove('d-none'); // For attendance/performance
    } else if (currentUser.role === 'student') {
      // Students mainly see test registration and their records
      testNavLink.classList.remove('d-none'); // For test register
      studentInfoNavLink.classList.remove('d-none'); // For performance/records
    }

  } else {
    loginNavItem.classList.remove('d-none');
    logoutNavItem.classList.add('d-none');
    dashboardNavItem.classList.add('d-none');

    schedulingNavLink.classList.add('d-none');
    testNavLink.classList.add('d-none');
    studentInfoNavLink.classList.add('d-none');
  }
  // Close mobile menu if open
  const navbarCollapse = document.getElementById('navbarNav');
  if (navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
  }
}

function toggleMobileMenu() {
    const navbarCollapse = document.getElementById('navbarNav');
    navbarCollapse.classList.toggle('show');
}

// Close dropdowns if clicked outside
document.addEventListener('click', function(event) {
    const teacherDropdownContent = document.getElementById('teacherDropdownContent');
    const teacherDropdownBtn = document.getElementById('teacherDropdownBtn');
    if (teacherDropdownContent && !teacherDropdownBtn.contains(event.target) && !teacherDropdownContent.contains(event.target)) {
        teacherDropdownContent.classList.remove('show-dropdown');
    }
});

// ========== DASHBOARD ==========
function loadDashboard() {
  const selectedDay = document.getElementById('filterDay').value;
  document.getElementById('dashboardSelectedDay').textContent = selectedDay;
  renderDashboardTable(selectedDay);
}

function renderDashboardTable(day) {
  const dashboardContent = document.getElementById('dashboardContent');
  const batches = getData('batches');
  const teachers = getData('teachers');
  const timeframes = getData('timeframes');
  const rooms = getData('rooms');
  const courses = getData('courses');

  const filteredBatches = batches.filter(batch => batch.days.includes(day));

  if (filteredBatches.length === 0) {
    dashboardContent.innerHTML = `<div class="alert alert-info text-center mt-3">No batches scheduled for ${day}.</div>`;
    return;
  }

  let tableHtml = `
    <table class="table table-hover table-striped mt-3 dashboard-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Course</th>
          <th>Batch</th>
          <th>Room</th>
          <th>Teachers</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  filteredBatches.sort((a, b) => {
    const timeA = parseTime(timeframes.find(tf => tf.id === a.timeframeId)?.start || '00:00');
    const timeB = parseTime(timeframes.find(tf => tf.id === b.timeframeId)?.start || '00:00');
    return timeA - timeB;
  });

  filteredBatches.forEach(batch => {
    const timeframe = timeframes.find(tf => tf.id === batch.timeframeId);
    const room = rooms.find(r => r.id === batch.roomId);
    const course = courses.find(c => c.id === batch.courseId);
    const assignedTeachers = batch.teacherIds.map(tId => teachers.find(t => t.id === tId)?.name).filter(Boolean).join(', ');

    tableHtml += `
      <tr class="dashboard-table-timeframe-row" onclick="showTimeframeDetails('${batch.id}')">
        <td data-label="Time:">${timeframe ? formatTime(timeframe.start) + ' - ' + formatTime(timeframe.end) : 'N/A'}</td>
        <td data-label="Course:">${course ? course.name : 'N/A'}</td>
        <td data-label="Batch:">${batch.batchNumber}</td>
        <td data-label="Room:">${room ? room.name : 'N/A'}</td>
        <td data-label="Teachers:">${assignedTeachers || 'N/A'}</td>
        <td data-label="Status:"><span class="badge bg-${batch.isActive ? 'success' : 'danger'}">${batch.isActive ? 'Active' : 'Inactive'}</span></td>
      </tr>
    `;
  });

  tableHtml += `
      </tbody>
    </table>
  `;
  dashboardContent.innerHTML = tableHtml;
}

function showTimeframeDetails(batchId) {
  const batch = getData('batches').find(b => b.id === batchId);
  if (batch) {
    const timeframe = getData('timeframes').find(tf => tf.id === batch.timeframeId);
    const room = getData('rooms').find(r => r.id === batch.roomId);
    const course = getData('courses').find(c => c.id === batch.courseId);
    const teachers = getData('teachers');
    const assignedTeachers = batch.teacherIds.map(tId => teachers.find(t => t.id === tId)?.name).filter(Boolean).join(', ');

    let details = `
      <h5>Batch Details</h5>
      <p><strong>Batch Number:</strong> ${batch.batchNumber}</p>
      <p><strong>Course:</strong> ${course ? course.name : 'N/A'}</p>
      <p><strong>Time:</strong> ${timeframe ? formatTime(timeframe.start) + ' - ' + formatTime(timeframe.end) : 'N/A'}</p>
      <p><strong>Room:</strong> ${room ? room.name : 'N/A'}</p>
      <p><strong>Days:</strong> ${batch.days.join(', ')}</p>
      <p><strong>Teachers:</strong> ${assignedTeachers || 'N/A'}</p>
      <p><strong>Status:</strong> <span class="badge bg-${batch.isActive ? 'success' : 'danger'}">${batch.isActive ? 'Active' : 'Inactive'}</span></p>
    `;
    showAlert(details, 'info');
  }
}


// ========== TEACHER MANAGEMENT ==========
function addTeacher() {
  const teacherName = document.getElementById('teacherName').value.trim();
  const teacherPhone = document.getElementById('teacherPhone').value.trim();

  if (teacherName && teacherPhone) {
    const teachers = getData('teachers');
    const newTeacher = {
      id: generateUniqueId(),
      name: teacherName,
      phone: teacherPhone
    };
    teachers.push(newTeacher);
    saveData('teachers', teachers);
    showAlert('Teacher added successfully!', 'success');
    document.getElementById('teacherName').value = '';
    document.getElementById('teacherPhone').value = '';
    loadTeachers();
  } else {
    showAlert('Please enter both teacher name and phone.', 'danger');
  }
}

function loadTeachers() {
  const teachers = getData('teachers');
  renderTeachers(teachers);
  populateTeacherDropdown();
}

function renderTeachers(teachers) {
  const teacherList = document.getElementById('teacherList');
  teacherList.innerHTML = '';
  if (teachers.length === 0) {
    teacherList.innerHTML = '<li class="list-group-item text-muted">No teachers added yet.</li>';
    return;
  }
  teachers.forEach(teacher => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <strong>${teacher.name}</strong> (${teacher.phone})
      </div>
      <div>
        <button class="btn btn-sm btn-info me-2" onclick="editTeacher('${teacher.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${teacher.id}')">Delete</button>
      </div>
    `;
    teacherList.appendChild(li);
  });
}

function editTeacher(id) {
  const teachers = getData('teachers');
  const teacher = teachers.find(t => t.id === id);
  if (teacher) {
    document.getElementById('teacherName').value = teacher.name;
    document.getElementById('teacherPhone').value = teacher.phone;
    document.getElementById('addTeacherBtn').textContent = 'Update Teacher';
    document.getElementById('addTeacherBtn').onclick = () => updateTeacher(id);
  }
}

function updateTeacher(id) {
  let teachers = getData('teachers');
  const teacherName = document.getElementById('teacherName').value.trim();
  const teacherPhone = document.getElementById('teacherPhone').value.trim();

  if (teacherName && teacherPhone) {
    teachers = teachers.map(t => t.id === id ? { ...t, name: teacherName, phone: teacherPhone } : t);
    saveData('teachers', teachers);
    showAlert('Teacher updated successfully!', 'success');
    document.getElementById('teacherName').value = '';
    document.getElementById('teacherPhone').value = '';
    document.getElementById('addTeacherBtn').textContent = 'Add Teacher';
    document.getElementById('addTeacherBtn').onclick = addTeacher;
    loadTeachers();
  } else {
    showAlert('Please enter both teacher name and phone.', 'danger');
  }
}

function deleteTeacher(id) {
  if (confirm('Are you sure you want to delete this teacher?')) {
    let teachers = getData('teachers');
    teachers = teachers.filter(t => t.id !== id);
    saveData('teachers', teachers);
    showAlert('Teacher deleted successfully!', 'info');
    loadTeachers();
  }
}

// ========== COURSE MANAGEMENT ==========
function addCourse() {
  const courseName = document.getElementById('courseName').value.trim();
  const courseDesc = document.getElementById('courseDesc').value.trim();

  if (courseName) {
    const courses = getData('courses');
    const newCourse = {
      id: generateUniqueId(),
      name: courseName,
      description: courseDesc
    };
    courses.push(newCourse);
    saveData('courses', courses);
    showAlert('Course added successfully!', 'success');
    document.getElementById('courseName').value = '';
    document.getElementById('courseDesc').value = '';
    loadCourses();
  } else {
    showAlert('Please enter course name.', 'danger');
  }
}

function loadCourses() {
  const courses = getData('courses');
  renderCourses(courses);
  populateBatchForms(); // Update course dropdown in batch form
}

function renderCourses(courses) {
  const courseList = document.getElementById('courseList');
  courseList.innerHTML = '';
  if (courses.length === 0) {
    courseList.innerHTML = '<li class="list-group-item text-muted">No courses added yet.</li>';
    return;
  }
  courses.forEach(course => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <strong>${course.name}</strong><br>
        <small>${course.description || 'No description'}</small>
      </div>
      <div>
        <button class="btn btn-sm btn-info me-2" onclick="editCourse('${course.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course.id}')">Delete</button>
      </div>
    `;
    courseList.appendChild(li);
  });
}

function editCourse(id) {
  const courses = getData('courses');
  const course = courses.find(c => c.id === id);
  if (course) {
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseDesc').value = course.description;
    document.getElementById('addCourseBtn').textContent = 'Update Course';
    document.getElementById('addCourseBtn').onclick = () => updateCourse(id);
  }
}

function updateCourse(id) {
  let courses = getData('courses');
  const courseName = document.getElementById('courseName').value.trim();
  const courseDesc = document.getElementById('courseDesc').value.trim();

  if (courseName) {
    courses = courses.map(c => c.id === id ? { ...c, name: courseName, description: courseDesc } : c);
    saveData('courses', courses);
    showAlert('Course updated successfully!', 'success');
    document.getElementById('courseName').value = '';
    document.getElementById('courseDesc').value = '';
    document.getElementById('addCourseBtn').textContent = 'Add Course';
    document.getElementById('addCourseBtn').onclick = addCourse;
    loadCourses();
  } else {
    showAlert('Please enter course name.', 'danger');
  }
}

function deleteCourse(id) {
  if (confirm('Are you sure you want to delete this course?')) {
    let courses = getData('courses');
    courses = courses.filter(c => c.id !== id);
    saveData('courses', courses);
    showAlert('Course deleted successfully!', 'info');
    loadCourses();
  }
}

// ========== TIME & PLACE MANAGEMENT ==========
function addTimeframe() {
  const start = document.getElementById('timeframeStart').value;
  const end = document.getElementById('timeframeEnd').value;

  if (start && end) {
    const timeframes = getData('timeframes');
    const newTimeframe = {
      id: generateUniqueId(),
      start: start,
      end: end
    };
    timeframes.push(newTimeframe);
    saveData('timeframes', timeframes);
    showAlert('Timeframe added successfully!', 'success');
    document.getElementById('timeframeStart').value = '';
    document.getElementById('timeframeEnd').value = '';
    loadTimeframes();
  } else {
    showAlert('Please enter both start and end times.', 'danger');
  }
}

function loadTimeframes() {
  const timeframes = getData('timeframes');
  renderTimeframes(timeframes);
  populateBatchForms(); // Update timeframe dropdown in batch form
}

function renderTimeframes(timeframes) {
  const timeframeList = document.getElementById('timeframeList');
  timeframeList.innerHTML = '';
  if (timeframes.length === 0) {
    timeframeList.innerHTML = '<li class="list-group-item text-muted">No timeframes added yet.</li>';
    return;
  }
  timeframes.sort((a, b) => parseTime(a.start) - parseTime(b.start)); // Sort by start time
  timeframes.forEach(tf => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        ${formatTime(tf.start)} - ${formatTime(tf.end)}
      </div>
      <div>
        <button class="btn btn-sm btn-danger" onclick="deleteTimeframe('${tf.id}')">Delete</button>
      </div>
    `;
    timeframeList.appendChild(li);
  });
}

function deleteTimeframe(id) {
  if (confirm('Are you sure you want to delete this timeframe?')) {
    let timeframes = getData('timeframes');
    timeframes = timeframes.filter(tf => tf.id !== id);
    saveData('timeframes', timeframes);
    showAlert('Timeframe deleted successfully!', 'info');
    loadTimeframes();
  }
}

function addRoom() {
  const roomName = document.getElementById('newRoom').value.trim();

  if (roomName) {
    const rooms = getData('rooms');
    const newRoom = {
      id: generateUniqueId(),
      name: roomName
    };
    rooms.push(newRoom);
    saveData('rooms', rooms);
    showAlert('Room added successfully!', 'success');
    document.getElementById('newRoom').value = '';
    loadRooms();
  } else {
    showAlert('Please enter a room number.', 'danger');
  }
}

function loadRooms() {
  const rooms = getData('rooms');
  renderRooms(rooms);
  populateBatchForms(); // Update room dropdown in batch form
}

function renderRooms(rooms) {
  const roomList = document.getElementById('roomList');
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    roomList.innerHTML = '<li class="list-group-item text-muted">No rooms added yet.</li>';
    return;
  }
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        ${room.name}
      </div>
      <div>
        <button class="btn btn-sm btn-danger" onclick="deleteRoom('${room.id}')">Delete</button>
      </div>
    `;
    roomList.appendChild(li);
  });
}

function deleteRoom(id) {
  if (confirm('Are you sure you want to delete this room?')) {
    let rooms = getData('rooms');
    rooms = rooms.filter(r => r.id !== id);
    saveData('rooms', rooms);
    showAlert('Room deleted successfully!', 'info');
    loadRooms();
  }
}

// ========== BATCH MANAGEMENT ==========
let selectedTeachersForBatch = [];
let selectedDaysForBatch = [];

function populateBatchForms() {
  const courses = getData('courses');
  const timeframes = getData('timeframes');
  const rooms = getData('rooms');
  const teachers = getData('teachers');

  const batchCourseSelect = document.getElementById('batchCourse');
  const batchTimeframeSelect = document.getElementById('batchTimeframe');
  const batchRoomSelect = document.getElementById('batchRoom');
  const teacherDropdownContent = document.getElementById('teacherDropdownContent');

  batchCourseSelect.innerHTML = '<option value="">Select Course</option>';
  courses.forEach(course => {
    batchCourseSelect.innerHTML += `<option value="${course.id}">${course.name}</option>`;
  });

  batchTimeframeSelect.innerHTML = '<option value="">Select Timeframe</option>';
  timeframes.sort((a, b) => parseTime(a.start) - parseTime(b.start));
  timeframes.forEach(tf => {
    batchTimeframeSelect.innerHTML += `<option value="${tf.id}">${formatTime(tf.start)} - ${formatTime(tf.end)}</option>`;
  });

  batchRoomSelect.innerHTML = '<option value="">Select Room</option>';
  rooms.forEach(room => {
    batchRoomSelect.innerHTML += `<option value="${room.id}">${room.name}</option>`;
  });

  teacherDropdownContent.innerHTML = '';
  teachers.forEach(teacher => {
    teacherDropdownContent.innerHTML += `
      <div class="dropdown-item form-check">
        <input class="form-check-input" type="checkbox" value="${teacher.id}" id="teacherCheck${teacher.id}" onchange="selectTeacherForBatch('${teacher.id}', '${teacher.name}')">
        <label class="form-check-label" for="teacherCheck${teacher.id}">
          ${teacher.name}
        </label>
      </div>
    `;
  });
  updateSelectedDays(); // Update selected days display on populate
  updateSelectedTeachersDisplay(); // Update selected teachers display
}

function updateSelectedDays() {
  const daysCheckboxes = document.querySelectorAll('#daysCheckboxes input[type="checkbox"]');
  selectedDaysForBatch = Array.from(daysCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  const selectedDaysDiv = document.getElementById('selectedDays');
  selectedDaysDiv.innerHTML = selectedDaysForBatch.map(day => `<span class="selected-day">${day}</span>`).join('');
}

function toggleTeacherDropdown(event) {
    event.stopPropagation(); // Prevent document click from closing it immediately
    document.getElementById('teacherDropdownContent').classList.toggle('show-dropdown');
}

function selectTeacherForBatch(teacherId, teacherName) {
  const checkbox = document.getElementById(`teacherCheck${teacherId}`);
  if (checkbox.checked) {
    if (!selectedTeachersForBatch.some(t => t.id === teacherId)) {
      selectedTeachersForBatch.push({ id: teacherId, name: teacherName });
    }
  } else {
    selectedTeachersForBatch = selectedTeachersForBatch.filter(t => t.id !== teacherId);
  }
  updateSelectedTeachersDisplay();
}

function updateSelectedTeachersDisplay() {
  const selectedTeachersDiv = document.getElementById('selectedTeachers');
  selectedTeachersDiv.innerHTML = selectedTeachersForBatch.map(teacher => `<span class="selected-teacher">${teacher.name}</span>`).join('');

  // Update checkboxes to reflect selectedTeachersForBatch array
  const checkboxes = document.querySelectorAll('#teacherDropdownContent input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectedTeachersForBatch.some(t => t.id === checkbox.value);
  });
}

function checkBatchConflicts(newBatch) {
  const batches = getData('batches');
  const conflictAlert = document.getElementById('conflictAlert');
  conflictAlert.classList.add('d-none');
  conflictAlert.innerHTML = '';

  const timeframes = getData('timeframes');
  const newTimeframe = timeframes.find(tf => tf.id === newBatch.timeframeId);
  if (!newTimeframe) return false;

  const newBatchStart = parseTime(newTimeframe.start);
  const newBatchEnd = parseTime(newTimeframe.end);

  let conflicts = [];

  batches.forEach(existingBatch => {
    // Skip comparing with itself if editing
    if (newBatch.id && existingBatch.id === newBatch.id) return;

    const existingTimeframe = timeframes.find(tf => tf.id === existingBatch.timeframeId);
    if (!existingTimeframe) return;

    const existingBatchStart = parseTime(existingTimeframe.start);
    const existingBatchEnd = parseTime(existingTimeframe.end);

    // Check for time overlap
    const timeOverlap = (newBatchStart < existingBatchEnd && newBatchEnd > existingBatchStart);

    // Check for day overlap
    const dayOverlap = newBatch.days.some(day => existingBatch.days.includes(day));

    // Check for room conflict
    const roomConflict = newBatch.roomId === existingBatch.roomId;

    // Check for teacher conflict
    const teacherConflict = newBatch.teacherIds.some(tId => existingBatch.teacherIds.includes(tId));


    if (timeOverlap && dayOverlap) {
      if (roomConflict) {
        conflicts.push(`Conflict: Room ${getData('rooms').find(r => r.id === newBatch.roomId)?.name} is occupied by Batch ${existingBatch.batchNumber} on ${newBatch.days.filter(day => existingBatch.days.includes(day)).join(', ')} from ${formatTime(existingTimeframe.start)} to ${formatTime(existingTimeframe.end)}.`);
      }
      if (teacherConflict) {
        const conflictingTeachers = newBatch.teacherIds.filter(tId => existingBatch.teacherIds.includes(tId))
          .map(tId => getData('teachers').find(t => t.id === tId)?.name).join(', ');
        conflicts.push(`Conflict: Teacher(s) ${conflictingTeachers} are assigned to Batch ${existingBatch.batchNumber} on ${newBatch.days.filter(day => existingBatch.days.includes(day)).join(', ')} from ${formatTime(existingTimeframe.start)} to ${formatTime(existingTimeframe.end)}.`);
      }
    }
  });

  if (conflicts.length > 0) {
    conflictAlert.classList.remove('d-none');
    conflictAlert.innerHTML = `<strong>Conflicts Detected:</strong><ul>${conflicts.map(c => `<li>${c}</li>`).join('')}</ul>`;
    return true; // Conflicts exist
  }
  return false; // No conflicts
}

function addOrUpdateBatch() {
  const editingBatchId = document.getElementById('editingBatchId').value;
  const courseId = document.getElementById('batchCourse').value;
  const timeframeId = document.getElementById('batchTimeframe').value;
  const roomId = document.getElementById('batchRoom').value;
  const batchNumber = document.getElementById('batchNumber').value.trim();
  const isActive = document.getElementById('batchActive').checked;

  if (!courseId || !timeframeId || !roomId || !batchNumber || selectedDaysForBatch.length === 0 || selectedTeachersForBatch.length === 0) {
    showAlert('Please fill all batch fields, select at least one day and one teacher.', 'danger');
    return;
  }

  const newBatchData = {
    id: editingBatchId || generateUniqueId(),
    courseId,
    timeframeId,
    roomId,
    batchNumber,
    days: selectedDaysForBatch,
    teacherIds: selectedTeachersForBatch.map(t => t.id),
    isActive
  };

  if (checkBatchConflicts(newBatchData)) {
    showAlert('Cannot save batch due to conflicts. Please resolve them.', 'danger');
    return;
  }

  let batches = getData('batches');
  if (editingBatchId) {
    batches = batches.map(batch => batch.id === editingBatchId ? newBatchData : batch);
    showAlert('Batch updated successfully!', 'success');
  } else {
    batches.push(newBatchData);
    showAlert('Batch created successfully!', 'success');
  }
  saveData('batches', batches);
  resetBatchForm();
  loadBatches();
}

function loadBatches() {
  const batches = getData('batches');
  renderBatches(batches);
}

function renderBatches(batches) {
  const batchList = document.getElementById('batchList');
  batchList.innerHTML = '';
  if (batches.length === 0) {
    batchList.innerHTML = '<li class="list-group-item text-muted">No batches created yet.</li>';
    return;
  }
  const courses = getData('courses');
  const timeframes = getData('timeframes');
  const rooms = getData('rooms');
  const teachers = getData('teachers');

  batches.forEach(batch => {
    const course = courses.find(c => c.id === batch.courseId);
    const timeframe = timeframes.find(tf => tf.id === batch.timeframeId);
    const room = rooms.find(r => r.id === batch.roomId);
    const assignedTeachers = batch.teacherIds.map(tId => teachers.find(t => t.id === tId)?.name).filter(Boolean).join(', ');

    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <strong>Batch ${batch.batchNumber}</strong> (${course ? course.name : 'N/A'})<br>
        <small>${timeframe ? formatTime(timeframe.start) + ' - ' + formatTime(timeframe.end) : 'N/A'} in ${room ? room.name : 'N/A'} on ${batch.days.join(', ')}</small><br>
        <small>Teachers: ${assignedTeachers || 'N/A'}</small>
      </div>
      <div>
        <span class="badge bg-${batch.isActive ? 'success' : 'danger'}">${batch.isActive ? 'Active' : 'Inactive'}</span>
        <button class="btn btn-sm btn-info ms-2 me-2" onclick="editBatch('${batch.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteBatch('${batch.id}')">Delete</button>
      </div>
    `;
    batchList.appendChild(li);
  });
}

function editBatch(id) {
  const batches = getData('batches');
  const batch = batches.find(b => b.id === id);
  if (batch) {
    document.getElementById('editingBatchId').value = batch.id;
    document.getElementById('batchCourse').value = batch.courseId;
    document.getElementById('batchTimeframe').value = batch.timeframeId;
    document.getElementById('batchRoom').value = batch.roomId;
    document.getElementById('batchNumber').value = batch.batchNumber;
    document.getElementById('batchActive').checked = batch.isActive;

    // Set selected days
    const daysCheckboxes = document.querySelectorAll('#daysCheckboxes input[type="checkbox"]');
    daysCheckboxes.forEach(cb => {
      cb.checked = batch.days.includes(cb.value);
    });
    updateSelectedDays();

    // Set selected teachers
    selectedTeachersForBatch = getData('teachers').filter(t => batch.teacherIds.includes(t.id)).map(t => ({ id: t.id, name: t.name }));
    updateSelectedTeachersDisplay();

    document.getElementById('addBatchBtn').textContent = 'Update Batch';
  }
}

function deleteBatch(id) {
  if (confirm('Are you sure you want to delete this batch?')) {
    let batches = getData('batches');
    batches = batches.filter(b => b.id !== id);
    saveData('batches', batches);
    showAlert('Batch deleted successfully!', 'info');
    loadBatches();
  }
}

function resetBatchForm() {
  document.getElementById('batchForm').reset();
  document.getElementById('editingBatchId').value = '';
  document.getElementById('addBatchBtn').textContent = 'Add Batch';
  selectedTeachersForBatch = [];
  selectedDaysForBatch = [];
  updateSelectedTeachersDisplay();
  updateSelectedDays();
  document.getElementById('conflictAlert').classList.add('d-none'); // Hide conflict alert
}



// ========== TEST MANAGEMENT ==========

/**
 * Renders speaking slot batches in the "Speaking Test Management" tab.
 * Each batch is displayed as a single item with a delete button.
 */
function renderSpeakingSlotBatches() {
    const container = document.getElementById('speakingSlotBatchesContainer');
    if (!container) return;
    container.innerHTML = '';
    const testSlots = getData('testSlots');
    const speakingSlots = testSlots.filter(slot => slot.module === 'speaking');

    if (speakingSlots.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No speaking slot batches created.</p>';
        return;
    }

    const batches = speakingSlots.reduce((acc, slot) => {
        const batchId = slot.batchId;
        if (batchId && !acc[batchId]) {
            acc[batchId] = {
                date: slot.date,
                count: 0,
                purpose: slot.purpose || 'individual' // Default to individual
            };
        }
        if(batchId) acc[batchId].count++;
        return acc;
    }, {});

    for (const batchId in batches) {
        const batch = batches[batchId];
        const batchDiv = document.createElement('div');
        batchDiv.className = 'list-group-item d-flex justify-content-between align-items-center flex-wrap';

        let purposeBadge;
        if (batch.purpose === 'mock') {
            purposeBadge = `<span class="badge bg-warning">Assigned to Mock Tests</span>`;
        } else {
            purposeBadge = `<span class="badge bg-info">Assigned to Individual Tests</span>`;
        }

        batchDiv.innerHTML = `
            <div class="me-auto">
                <strong>Date: ${new Date(batch.date).toLocaleDateString()}</strong>
                <span class="badge bg-secondary ms-2">${batch.count} slots</span>
                <div class="mt-1">${purposeBadge}</div>
            </div>
            <div class="btn-group mt-2 mt-md-0" role="group">
                <button class="btn btn-sm btn-outline-info" onclick="setSpeakingBatchPurpose('${batchId}', 'individual')" ${batch.purpose === 'individual' ? 'disabled' : ''}>Set for Individual</button>
                <button class="btn btn-sm btn-outline-warning" onclick="setSpeakingBatchPurpose('${batchId}', 'mock')" ${batch.purpose === 'mock' ? 'disabled' : ''}>Set for Mock</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSpeakingSlotBatch('${batchId}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        container.appendChild(batchDiv);
    }
}

function setSpeakingBatchPurpose(batchId, purpose) {
    let testSlots = getData('testSlots');
    // Find all slots belonging to this batch and update their purpose
    testSlots.forEach(slot => {
        if (slot.batchId === batchId) {
            slot.purpose = purpose;
        }
    });
    saveData('testSlots', testSlots);
    showAlert(`Batch has been set for ${purpose} tests.`, 'success');
    renderSpeakingSlotBatches(); // Re-render to update UI
}

/**
 * Deletes an entire batch of speaking slots based on the batchId.
 * @param {string} batchId - The unique identifier for the batch of slots to be deleted.
 */
function deleteSpeakingSlotBatch(batchId) {
    if (confirm('Are you sure you want to delete this entire batch of slots? This action cannot be undone.')) {
        let testSlots = getData('testSlots');
        // Filter out all slots that match the given batchId
        testSlots = testSlots.filter(slot => slot.batchId !== batchId);
        saveData('testSlots', testSlots);
        showAlert('Speaking slot batch deleted successfully!', 'info');
        
        // Re-render the UI elements to reflect the deletion
        renderSpeakingSlotBatches();
        populateSpeakingSlotsDropdown();
        loadTestSlots();
    }
}

function generateSpeakingSlots() {
  const container = document.getElementById('speakingTimeSlotsContainer');
  container.innerHTML = ''; // Clear previous slots

  const startTime = new Date();
  startTime.setHours(9, 0, 0, 0); // 9:00 AM

  const endTime = new Date();
  endTime.setHours(19, 0, 0, 0); // 7:00 PM

  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + 20 * 60 * 1000); // Add 20 minutes

    const startTimeStr = slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeRange = `${startTimeStr} - ${endTimeStr}`;

    const li = document.createElement('li');
    li.className = 'generated-slot-item';
    li.textContent = timeRange;
    li.setAttribute('data-time', timeRange);

    const removeBtn = document.createElement('span');
    removeBtn.className = 'remove-slot-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Remove this slot';
    removeBtn.onclick = () => li.remove(); // Remove the list item when clicked

    li.appendChild(removeBtn);
    container.appendChild(li);

    // Move to the next 20-minute interval
    currentTime.setMinutes(currentTime.getMinutes() + 20);
  }
}

/**
 * Creates and saves all generated speaking time slots for a selected date.
 * This function reads the generated slots from the UI, saves them to localStorage,
 * and then updates the list of "Upcoming speaking test days".
 */
function createAllSpeakingSlots() {
  const date = document.getElementById('speakingTestDate').value;
  const slotItems = document.querySelectorAll('#speakingTimeSlotsContainer .generated-slot-item');

  if (!date) {
    showAlert('Please select a date first.', 'danger');
    return;
  }

  if (slotItems.length === 0) {
    showAlert('No time slots are listed. Please generate slots first.', 'warning');
    return;
  }

  const testSlots = getData('testSlots');
  let newSlotsCreated = 0;
  // Generate a single, unique ID for this entire batch of slots
  const batchId = `batch-${Date.now()}`;

  slotItems.forEach(item => {
    const timeRange = item.getAttribute('data-time');
    const newTestSlot = {
      id: generateUniqueId(),
      batchId: batchId, // Add the batch ID to each slot
      purpose: 'individual', // Default purpose for new batches
      type: 'partial',
      module: 'speaking',
      date: date,
      time: timeRange,
      teacher: '', // Teacher is assigned later
      room: '',    // Room is assigned later
      totalSeats: 1,
      availableSeats: 1,
      registeredStudents: []
    };
    testSlots.push(newTestSlot);
    newSlotsCreated++;
  });

  saveData('testSlots', testSlots);
  showAlert(`${newSlotsCreated} speaking slots have been created successfully for ${date}!`, 'success');

  // Clear the form and update the relevant UI sections
  document.getElementById('speakingTimeSlotsContainer').innerHTML = '<li class="text-center p-3">Slots have been created. Generate new slots for another day if needed.</li>';
  loadTestSlots(); // Refresh the main upcoming test list
  renderSpeakingSlotBatches(); // Refresh the list of speaking batches
  populateSpeakingSlotsDropdown(); // Refresh the unified dropdown
}


function showMockTest() {
  document.getElementById('mockTestFields').style.display = 'block'; // Corrected ID and set display to block
  document.getElementById('partialTestFields').style.display = 'none'; // Corrected ID and set display to none
  document.getElementById('mockTestBtn').classList.add('active'); // Add active class to Mock Test button
  document.getElementById('partialTestBtn').classList.remove('active'); // Remove active class from Partial Test button
  document.getElementById('testModuleSelect').value = "mock";
  loadTestSlots();
}
function showPartialTest() {
  document.getElementById('mockTestFields').style.display = 'none';
  document.getElementById('partialTestFields').style.display = 'block';

  // Add this line to debug:
  console.log("Element with ID 'mockTestBtn':", document.getElementById('mockTestBtn'));

  document.getElementById('mockTestBtn').classList.remove('active');
  document.getElementById('partialTestBtn').classList.add('active');
}

document.getElementById('partialTestModule').addEventListener('change', function() {
  const selectedModule = this.value;
  const partialTimeContainer = document.getElementById('partialTimeContainer');
  const partialTestTimeSelect = document.getElementById('partialTestTime');
  partialTestTimeSelect.innerHTML = '<option value="">Select Time</option>'; // Clear existing options

  if (selectedModule === 'speaking') {
    partialTimeContainer.classList.remove('d-none');
    populateSpeakingTestTimes();
  } else if (selectedModule === 'listening' || selectedModule === 'reading' || selectedModule === 'writing') {
    partialTimeContainer.classList.remove('d-none');
    // For Listening, Reading, Writing, the time is typically fixed or chosen from predefined slots if available
    // For now, we'll just add a placeholder or specific times if known.
    // In a real app, you might fetch these from a 'timeframes' like system or have fixed times for these modules.
    // For demonstration, let's add some generic times.
    partialTestTimeSelect.innerHTML += `
      <option value="09:00-10:00">09:00 AM - 10:00 AM</option>
      <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
      <option value="14:00-15:00">02:00 PM - 03:00 PM</option>
    `;
  } else {
    partialTimeContainer.classList.add('d-none');
  }
});

function populateSpeakingTestTimes() {
  const partialTestTimeSelect = document.getElementById('partialTestTime');
  partialTestTimeSelect.innerHTML = '<option value="">Select Time</option>'; // Clear existing options

  const startHour = 9; // 9:00 AM
  const endHour = 17; // 5:00 PM (exclusive, as loop goes up to < endHour)
  const intervalMinutes = 20;
  const breakStartMinutes = parseTime('13:21'); // 1:21 PM
  const breakEndMinutes = parseTime('13:59'); // 1:59 PM

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const currentMinutes = h * 60 + m;

      // Skip times falling within the break
      if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
        continue;
      }

      // Ensure the end of the slot does not exceed 5:20 PM (17:20)
      if (currentMinutes + intervalMinutes > parseTime('17:21')) { // 5:20 PM (17:20) is the last slot start, so it ends at 17:40
          continue;
      }
        
      const startTime = new Date();
      startTime.setHours(h);
      startTime.setMinutes(m);
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);

      const endTime = new Date(startTime.getTime() + intervalMinutes * 60 * 1000);

      const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const value = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}-${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      
      partialTestTimeSelect.innerHTML += `<option value="${value}">${formattedStartTime} - ${formattedEndTime}</option>`;
    }
  }
}

function createMockTest() {
  const date = document.getElementById('mockTestDate').value;
  const time = document.getElementById('mockTestTime').value;
  const totalSeats = parseInt(document.getElementById('mockTotalSeats').value, 10);
  const speakingBatchId = document.getElementById('mockTestSpeakingBatchSelect').value;

  if (!date || !time || !speakingBatchId || isNaN(totalSeats) || totalSeats <= 0) {
    showAlert('Please fill all fields and select a valid Speaking Batch.', 'danger');
    return;
  }

  // Create the main LRW (Listening, Reading, Writing) slot
  const newMockLRW_Slot = {
    id: generateUniqueId(),
    type: 'mock',
    module: 'LRW', // Listening, Reading, Writing
    date: date,
    time: time,
    speakingBatchId: speakingBatchId, // Link to the speaking batch
    totalSeats: totalSeats,
    availableSeats: totalSeats,
    registeredStudents: []
  };

  const testSlots = getData('testSlots');
  testSlots.push(newMockLRW_Slot);
  saveData('testSlots', testSlots);

  showAlert('Mock Test created successfully!', 'success');
  document.getElementById('mockTestForm').reset();
  loadTestSlots();
  populateMockSpeakingBatchesDropdown(); // Refresh dropdown
}

function populateMockSpeakingBatchesDropdown() {
    const select = document.getElementById('mockTestSpeakingBatchSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select a Speaking Batch --</option>';
    const testSlots = getData('testSlots');
    
    // Find batches with purpose 'mock'
    const mockBatches = testSlots.reduce((acc, slot) => {
        if (slot.purpose === 'mock' && slot.batchId && !acc[slot.batchId]) {
            acc[slot.batchId] = { date: slot.date, count: 0 };
        }
        if (slot.purpose === 'mock' && slot.batchId) {
            acc[slot.batchId].count++;
        }
        return acc;
    }, {});

    if (Object.keys(mockBatches).length === 0) {
        select.innerHTML = '<option value="" disabled>No speaking batches set for Mock Tests</option>';
        return;
    }

    for (const batchId in mockBatches) {
        const batch = mockBatches[batchId];
        const option = document.createElement('option');
        option.value = batchId;
        option.textContent = `Batch from ${new Date(batch.date).toLocaleDateString()} (${batch.count} slots)`;
        select.appendChild(option);
    }
}

function toggleIndividualModuleSetup(module) {
    const lrwForm = document.getElementById('lrwSetupForm');
    const speakingForm = document.getElementById('speakingSetupForm');

    if (module === 'listening' || module === 'reading' || module === 'writing') {
        lrwForm.classList.remove('d-none');
        speakingForm.classList.add('d-none');
        // Populate dropdowns for the LRW form
        populateTeacherRoomDropdowns('lrw');
    } else if (module === 'speaking') {
        lrwForm.classList.add('d-none');
        speakingForm.classList.remove('d-none');
    } else {
        lrwForm.classList.add('d-none');
        speakingForm.classList.add('d-none');
    }
}

function createLRW_Test() {
    const module = document.getElementById('individualModuleSelect').value;
    const date = document.getElementById('lrwTestDate').value;
    const time = document.getElementById('lrwTestTime').value;
    const roomId = document.getElementById('lrwTestRoom').value;
    const teacherId = document.getElementById('lrwTestTeacher').value;
    const totalSeats = parseInt(document.getElementById('lrwTotalSeats').value, 10);

    if (!module || !date || !time || !roomId || !teacherId || isNaN(totalSeats) || totalSeats <= 0) {
        showAlert('Please fill all fields with valid data.', 'danger');
        return;
    }

    const newTestSlot = {
        id: generateUniqueId(),
        type: 'partial',
        module: module,
        date: date,
        time: time,
        room: roomId,
        teacher: teacherId,
        totalSeats: totalSeats,
        availableSeats: totalSeats,
        registeredStudents: []
    };

    const testSlots = getData('testSlots');
    testSlots.push(newTestSlot);
    saveData('testSlots', testSlots);

    showAlert(`${module.charAt(0).toUpperCase() + module.slice(1)} test slot created successfully!`, 'success');
    document.getElementById('lrwSetupForm').querySelector('form')?.reset(); // Reset form if it is a form element
    document.getElementById('individualModuleSelect').value = "";
    toggleIndividualModuleSetup('');
    loadTestSlots();
}

function createPartialTest() {
  const date = document.getElementById('partialTestDate').value;
  const module = document.getElementById('partialTestModule').value;
  const time = document.getElementById('partialTestTime').value; // This will be relevant for LRW
  const room = document.getElementById('partialTestRoom').value;
  const teacher = document.getElementById('partialTestTeacher').value;
  const totalSeats = parseInt(document.getElementById('partialTotalSeats').value, 10);

  // Validation logic
  if (!date || !module || !room || !teacher || isNaN(totalSeats) || totalSeats <= 0) {
    showAlert('Please fill all common fields for Partial Test and ensure Total Seats is a valid number.', 'danger');
    return;
  }

  // Time is required for Listening, Reading, Writing, but not for Speaking (as it has specific slots)
  if ((module === 'listening' || module === 'reading' || module === 'writing') && !time) {
    showAlert('Please select a time for the ' + module + ' test.', 'danger');
    return;
  } else if (module === 'speaking' && !time) {
    showAlert('Please select a time slot for the Speaking test.', 'danger');
    return;
  }

  const newTest = {
    id: generateUniqueId(),
    type: 'partial',
    module: module,
    date: date,
    time: time, // Time will be specific for Speaking, general for LRW
    room: room,
    teacher: teacher,
    totalSeats: totalSeats,
    availableSeats: totalSeats,
    registeredStudents: []
  };

  const testSlots = getData('testSlots');
  testSlots.push(newTest);
  saveData('testSlots', testSlots);
  showAlert('Partial Test created successfully!', 'success');
  document.getElementById('partialTestForm').reset();
  document.getElementById('partialTimeContainer').classList.add('d-none'); // Hide time field again
  document.getElementById('partialTestTime').innerHTML = '<option value="">Select Time</option>'; // Clear time options
  loadTestSlots();
}

function loadTestSlots() {
  const slotsContainer = document.getElementById('testSlotsList');
  if (!slotsContainer) {
    return;
  }

  const testSlots = getData('testSlots');
  const teachers = getData('teachers');

  // 1. Separate Mock Tests
  const mockSlots = testSlots.filter(slot => slot.type === 'mock');

  // 2. Separate Partial Slots into Speaking and Others (LRW)
  const allPartialSlots = testSlots.filter(slot => slot.type === 'partial');
  const speakingSlots = allPartialSlots.filter(slot => slot.module === 'speaking');
  const lrwSlots = allPartialSlots.filter(slot => slot.module !== 'speaking');

  let html = '<h5>Mock Tests</h5>';
  if (mockSlots.length > 0) {
    html += '<ul class="list-group mb-4">';
    mockSlots.forEach(test => {
      const teacherName = teachers.find(t => t.id === test.teacher)?.name || 'N/A';
      
      // Since speaking slots are now linked by batch, we find one slot from the batch to display info
      const speakingBatchId = test.speakingBatchId;
      const speakingSlotSample = speakingSlots.find(s => s.batchId === speakingBatchId);
      const speakingInfo = speakingSlotSample ? `Speaking Batch from ${new Date(speakingSlotSample.date).toLocaleDateString()}` : 'Speaking batch not set';

      html += `
        <li class="list-group-item test-slot-card mock">
          <strong>Date (LRW):</strong> ${test.date} at ${test.time}<br>
          <strong>Speaking:</strong> ${speakingInfo}<br>
          <strong>Seats:</strong> ${test.availableSeats} / ${test.totalSeats}
          <span class="badge bg-${test.availableSeats > 0 ? 'success' : 'danger'} float-end">${test.availableSeats > 0 ? 'Open' : 'Full'}</span>
        </li>
      `;
    });
    html += '</ul>';
  } else {
    html += '<p class="text-muted">No mock tests created yet.</p>';
  }

  html += '<h5 class="mt-4">Individual Module / Speaking Slots</h5>';

  // 3. Group Speaking Slots by Batch
  const speakingBatches = speakingSlots.reduce((acc, slot) => {
    const batchId = slot.batchId;
    if (!acc[batchId]) {
      acc[batchId] = { date: slot.date, slots: [] };
    }
    acc[batchId].slots.push(slot);
    return acc;
  }, {});

  // 4. Render Speaking Batches as an Accordion
  if (Object.keys(speakingBatches).length > 0) {
    html += '<div class="accordion mb-3" id="speakingSlotsAccordion">';
    for (const batchId in speakingBatches) {
      const batch = speakingBatches[batchId];
      const accordionId = `collapse-${batchId}`;
      const headerId = `heading-${batchId}`;

      html += `
        <div class="accordion-item">
          <h2 class="accordion-header" id="${headerId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}">
              Speaking Batch - ${new Date(batch.date).toLocaleDateString()} (${batch.slots.length} slots)
            </button>
          </h2>
          <div id="${accordionId}" class="accordion-collapse collapse" data-bs-parent="#speakingSlotsAccordion">
            <div class="accordion-body p-2">
              <ul class="list-group">`;
      
      batch.slots.forEach(slot => {
        html += `
          <li class="list-group-item d-flex justify-content-between align-items-center test-slot-card ielts py-1">
            <span>Slot Time: <strong>${slot.time}</strong></span>
            <span class="badge bg-${slot.availableSeats > 0 ? 'success' : 'danger'}">${slot.availableSeats > 0 ? 'Open' : 'Full'}</span>
          </li>`;
      });

      html += `</ul>
            </div>
          </div>
        </div>`;
    }
    html += '</div>';
  }

  // 5. Render individual LRW slots
  if (lrwSlots.length > 0) {
    html += '<ul class="list-group">';
    lrwSlots.forEach(test => {
      const teacherName = teachers.find(t => t.id === test.teacher)?.name || 'N/A';
      html += `
        <li class="list-group-item test-slot-card">
          <strong>Module:</strong> ${test.module.toUpperCase()}<br>
          <strong>Date:</strong> ${test.date} at ${test.time}<br>
          <strong>Teacher:</strong> ${teacherName || 'Not Assigned'}<br>
          <strong>Seats:</strong> ${test.availableSeats} / ${test.totalSeats}
          <span class="badge bg-${test.availableSeats > 0 ? 'success' : 'danger'} float-end">${test.availableSeats > 0 ? 'Open' : 'Full'}</span>
        </li>
      `;
    });
    html += '</ul>';
  }
  
  if (lrwSlots.length === 0 && Object.keys(speakingBatches).length === 0) {
      html += '<p class="text-muted">No individual module tests or speaking slots created yet.</p>';
  }

  slotsContainer.innerHTML = html;
}

function editTestSlot(id) {
  const testSlots = getData('testSlots');
  const testSlot = testSlots.find(slot => slot.id === id);

  if (testSlot) {
    document.getElementById('editTestId').value = testSlot.id;
    document.getElementById('editTestType').value = testSlot.type;

    // Reset visibility of sections
    document.getElementById('editMockTestFields').classList.add('d-none');
    document.getElementById('editPartialTestFields').classList.add('d-none');
    document.getElementById('editPartialTimeContainer').classList.add('d-none'); // Hide partial time by default

    if (testSlot.type === 'mock') {
      document.getElementById('editMockTestFields').classList.remove('d-none');
      document.getElementById('editMockTestDate').value = testSlot.date;
      document.getElementById('editMockTestTime').value = testSlot.time;
      document.getElementById('editMockTestRoom').value = testSlot.room;
      document.getElementById('editMockTestTeacher').value = testSlot.teacher;
      document.getElementById('editMockTotalSeats').value = testSlot.totalSeats;
    } else if (testSlot.type === 'partial') {
      document.getElementById('editPartialTestFields').classList.remove('d-none');
      document.getElementById('editPartialTestDate').value = testSlot.date;
      document.getElementById('editPartialTestModule').value = testSlot.module;
      document.getElementById('editPartialTestRoom').value = testSlot.room;
      document.getElementById('editPartialTestTeacher').value = testSlot.teacher;
      document.getElementById('editPartialTotalSeats').value = testSlot.totalSeats;

      // Show and populate time field for partial tests
      document.getElementById('editPartialTimeContainer').classList.remove('d-none');
      const editPartialTestTimeSelect = document.getElementById('editPartialTestTime');
      editPartialTestTimeSelect.innerHTML = '<option value="">Select Time</option>';
      if (testSlot.module === 'speaking') {
          populateSpeakingTestTimesEdit(editPartialTestTimeSelect);
      } else {
           editPartialTestTimeSelect.innerHTML += `
            <option value="09:00-10:00">09:00 AM - 10:00 AM</option>
            <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
            <option value="14:00-15:00">02:00 PM - 03:00 PM</option>
          `;
      }
      editPartialTestTimeSelect.value = testSlot.time;
    }

    populateTeacherRoomDropdowns('edit'); // Populate dropdowns for edit form
    
    const editModal = new bootstrap.Modal(document.getElementById('editTestSlotModal'));
    editModal.show();
  }
}

function populateSpeakingSlotsDropdown() {
  const speakingSlotSelect = document.getElementById('mockTestSpeakingSlotSelect');
  if (!speakingSlotSelect) return;
  speakingSlotSelect.innerHTML = '<option value="">-- Select a Speaking Slot --</option>';

  const testSlots = getData('testSlots');
  
  // Get all speaking slots that have available seats
  const speakingSlots = testSlots.filter(slot =>
    slot.module === 'speaking' &&
    slot.availableSeats > 0
  );

  if (speakingSlots.length === 0) {
    speakingSlotSelect.innerHTML = '<option value="" disabled>No speaking slots are available</option>';
    return;
  }
    
  // Sort slots by date and time for a better user experience
  speakingSlots.sort((a,b) => new Date(a.date) - new Date(b.date) || a.time.localeCompare(b.time));

  speakingSlots.forEach(slot => {
    speakingSlotSelect.innerHTML += `
      <option value="${slot.id}">
        ${slot.date} at ${slot.time} (${slot.availableSeats} seat left)
      </option>
    `;
  });
}

function populateSpeakingTestTimesEdit(selectElement) {
  selectElement.innerHTML = '<option value="">Select Time</option>';

  const startHour = 9; // 9:00 AM
  const endHour = 17; // 5:00 PM (exclusive, as loop goes up to < endHour)
  const intervalMinutes = 20;
  const breakStartMinutes = parseTime('13:21'); // 1:21 PM
  const breakEndMinutes = parseTime('13:59'); // 1:59 PM

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const currentMinutes = h * 60 + m;

      // Skip times falling within the break
      if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
        continue;
      }

      // Ensure the end of the slot does not exceed 5:20 PM (17:20)
      if (currentMinutes + intervalMinutes > parseTime('17:21')) { // 5:20 PM (17:20) is the last slot start, so it ends at 17:40
          continue;
      }
        
      const startTime = new Date();
      startTime.setHours(h);
      startTime.setMinutes(m);
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);

      const endTime = new Date(startTime.getTime() + intervalMinutes * 60 * 1000);

      const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const value = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}-${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      
      selectElement.innerHTML += `<option value="${value}">${formattedStartTime} - ${formattedEndTime}</option>`;
    }
  }
}

document.getElementById('editPartialTestModule').addEventListener('change', function() {
  const selectedModule = this.value;
  const editPartialTimeContainer = document.getElementById('editPartialTimeContainer');
  const editPartialTestTimeSelect = document.getElementById('editPartialTestTime');
  editPartialTestTimeSelect.innerHTML = '<option value="">Select Time</option>'; // Clear existing options

  if (selectedModule === 'speaking') {
    editPartialTimeContainer.classList.remove('d-none');
    populateSpeakingTestTimesEdit(editPartialTestTimeSelect);
  } else if (selectedModule === 'listening' || selectedModule === 'reading' || selectedModule === 'writing') {
    editPartialTimeContainer.classList.remove('d-none');
    editPartialTestTimeSelect.innerHTML += `
      <option value="09:00-10:00">09:00 AM - 10:00 AM</option>
      <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
      <option value="14:00-15:00">02:00 PM - 03:00 PM</option>
    `;
  } else {
    editPartialTimeContainer.classList.add('d-none');
  }
});

function updateTestSlot() {
  const id = document.getElementById('editTestId').value;
  const type = document.getElementById('editTestType').value;
  let updatedTest = null;

  if (type === 'mock') {
    const date = document.getElementById('editMockTestDate').value;
    const time = document.getElementById('editMockTestTime').value;
    const room = document.getElementById('editMockTestRoom').value;
    const teacher = document.getElementById('editMockTestTeacher').value;
    const totalSeats = parseInt(document.getElementById('editMockTotalSeats').value, 10);

    if (!date || !time || !room || !teacher || isNaN(totalSeats) || totalSeats <= 0) {
      showAlert('Please fill all fields for Mock Test and ensure Total Seats is a valid number.', 'danger');
      return;
    }
    updatedTest = { id, type, date, time, room, teacher, totalSeats };
  } else if (type === 'partial') {
    const date = document.getElementById('editPartialTestDate').value;
    const module = document.getElementById('editPartialTestModule').value;
    const time = document.getElementById('editPartialTestTime').value;
    const room = document.getElementById('editPartialTestRoom').value;
    const teacher = document.getElementById('editPartialTestTeacher').value;
    const totalSeats = parseInt(document.getElementById('editPartialTotalSeats').value, 10);

    if (!date || !module || !room || !teacher || isNaN(totalSeats) || totalSeats <= 0) {
      showAlert('Please fill all common fields for Partial Test and ensure Total Seats is a valid number.', 'danger');
      return;
    }

    if ((module === 'listening' || module === 'reading' || module === 'writing') && !time) {
      showAlert('Please select a time for the ' + module + ' test.', 'danger');
      return;
    } else if (module === 'speaking' && !time) {
      showAlert('Please select a time slot for the Speaking test.', 'danger');
      return;
    }

    updatedTest = { id, type, module, date, time, room, teacher, totalSeats };
  }

  if (updatedTest) {
    let testSlots = getData('testSlots');
    // Maintain availableSeats from existing slot if not changing totalSeats
    const originalTest = testSlots.find(slot => slot.id === id);
    if (originalTest) {
      updatedTest.registeredStudents = originalTest.registeredStudents;
      if (updatedTest.totalSeats !== originalTest.totalSeats) {
        updatedTest.availableSeats = updatedTest.totalSeats - originalTest.registeredStudents.length;
      } else {
        updatedTest.availableSeats = originalTest.availableSeats;
      }
    }

    testSlots = testSlots.map(slot => slot.id === id ? updatedTest : slot);
    saveData('testSlots', testSlots);
    showAlert('Test slot updated successfully!', 'success');
    
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editTestSlotModal'));
    editModal.hide();
    loadTestSlots();
  }
}

function deleteTestSlot(id) {
  if (confirm('Are you sure you want to delete this test slot?')) {
    let testSlots = getData('testSlots');
    testSlots = testSlots.filter(slot => slot.id !== id);
    saveData('testSlots', testSlots);
    showAlert('Test slot deleted successfully!', 'info');
    loadTestSlots();
  }
}

function populateTeacherRoomDropdowns(prefix = '') {
  const teachers = getData('teachers');
  const rooms = getData('rooms');

  const teacherSelectId = prefix ? `${prefix}TestTeacher` : 'mockTestTeacher';
  const roomSelectId = prefix ? `${prefix}TestRoom` : 'mockTestRoom';

  // Handle new LRW form prefixes
  if (prefix === 'lrw') {
      const lrwTeacherSelect = document.getElementById('lrwTestTeacher');
      const lrwRoomSelect = document.getElementById('lrwTestRoom');
      
      if(lrwTeacherSelect) {
          lrwTeacherSelect.innerHTML = '<option value="">Select Teacher</option>';
          teachers.forEach(teacher => {
              lrwTeacherSelect.innerHTML += `<option value="${teacher.id}">${teacher.name}</option>`;
          });
      }
      if(lrwRoomSelect) {
          lrwRoomSelect.innerHTML = '<option value="">Select Room</option>';
          rooms.forEach(room => {
              lrwRoomSelect.innerHTML += `<option value="${room.id}">${room.name}</option>`;
          });
      }
      return; // Exit function after handling LRW form
  }

  const teacherSelect = document.getElementById(teacherSelectId);
  const roomSelect = document.getElementById(roomSelectId);

  // For partial tests, the teacher and room selects are different IDs
  const partialTeacherSelectId = prefix ? `${prefix}PartialTestTeacher` : 'partialTestTeacher';
  const partialRoomSelectId = prefix ? `${prefix}PartialTestRoom` : 'partialTestRoom';
  
  const partialTeacherSelect = document.getElementById(partialTeacherSelectId);
  const partialRoomSelect = document.getElementById(partialRoomSelectId);

  [teacherSelect, partialTeacherSelect].forEach(select => {
    if (select) {
      const currentValue = select.value; // Preserve current value if set
      select.innerHTML = '<option value="">Select Teacher</option>';
      teachers.forEach(teacher => {
        select.innerHTML += `<option value="${teacher.id}">${teacher.name}</option>`;
      });
      select.value = currentValue; // Restore current value
    }
  });

  [roomSelect, partialRoomSelect].forEach(select => {
    if (select) {
      const currentValue = select.value; // Preserve current value if set
      select.innerHTML = '<option value="">Select Room</option>';
      rooms.forEach(room => {
        select.innerHTML += `<option value="${room.id}">${room.name}</option>`;
      });
      select.value = currentValue; // Restore current value
    }
  });
}


// Call this on page load or when relevant section is shown
document.addEventListener('DOMContentLoaded', () => {
  populateTeacherRoomDropdowns(); // for mockTestTeacher, mockTestRoom
  populateTeacherRoomDropdowns('partial'); // for partialTestTeacher, partialTestRoom
  populateTeacherRoomDropdowns('editMock'); // for edit mock test form
  populateTeacherRoomDropdowns('editPartial'); // for edit partial test form
});


// ========== TEST REGISTRATION ==========

function showRegistrationForm(testType) {
  const registrationForm = document.getElementById('testRegistrationForm');
  const studentInfoForm = document.getElementById('studentInfoForm');
  const registerTestSelect = document.getElementById('registerTestSelect');

  // Reset module selection if changing type
  if (document.getElementById('registerModuleSelect').value !== testType) {
    document.getElementById('registerModuleSelect').value = testType;
  }
  
  // Update available test slots based on type
  populateTestSlotDropdowns(testType);

  // If there are no slots of the selected type, hide the form and show alert
  const availableSlots = getData('testSlots').filter(slot => slot.type === testType && slot.availableSeats > 0);
  if (availableSlots.length === 0) {
    showAlert(`No open ${testType} test slots available for registration.`, 'info');
    hideRegistrationForm();
    return;
  }

  registrationForm.classList.remove('d-none');
  studentInfoForm.classList.add('d-none'); // Hide student info until slot is selected
  document.getElementById('registerTestBtn').classList.add('d-none'); // Hide register button initially
  document.getElementById('registerTestSelect').value = ""; // Reset dropdown
}

function hideRegistrationForm() {
  document.getElementById('testRegistrationForm').classList.add('d-none');
  document.getElementById('studentInfoForm').classList.add('d-none');
  document.getElementById('registerTestBtn').classList.add('d-none');
  document.getElementById('registerTestSelect').innerHTML = '';
  document.getElementById('registerModuleSelect').value = ''; // Clear module selection
  document.getElementById('studentName').value = '';
  document.getElementById('studentPhone').value = '';
  document.getElementById('studentEmail').value = '';
}


function populateTestSlotDropdowns(type) {
  const registerTestSelect = document.getElementById('registerTestSelect');
  registerTestSelect.innerHTML = '<option value="">Select a Test Slot</option>';
  const testSlots = getData('testSlots');
  const teachers = getData('teachers');
  const rooms = getData('rooms');

  const filteredSlots = testSlots.filter(slot => slot.type === type && slot.availableSeats > 0);

  if (filteredSlots.length === 0) {
    registerTestSelect.innerHTML = '<option value="">No Slots Available</option>';
    return;
  }

  // Sort by date and then time for better user experience
  filteredSlots.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    // Then by time if dates are the same
    const [timeAStart] = a.time.split('-');
    const [timeBStart] = b.time.split('-');
    return parseTime(timeAStart) - parseTime(timeBStart);
  });

  filteredSlots.forEach(slot => {
    const teacherName = teachers.find(t => t.id === slot.teacher)?.name || 'N/A';
    const roomName = rooms.find(r => r.id === slot.room)?.name || 'N/A';
    const moduleInfo = slot.type === 'partial' ? `(${slot.module.toUpperCase()})` : '';
    registerTestSelect.innerHTML += `
      <option value="${slot.id}">
        ${slot.date} ${slot.time} ${moduleInfo} - ${roomName} (${teacherName}) - ${slot.availableSeats} seats left
      </option>
    `;
  });
}

function displayStudentInfoForm() {
  const selectedTestId = document.getElementById('registerTestSelect').value;
  const studentInfoForm = document.getElementById('studentInfoForm');
  const registerTestBtn = document.getElementById('registerTestBtn');

  if (selectedTestId) {
    studentInfoForm.classList.remove('d-none');
    registerTestBtn.classList.remove('d-none');
  } else {
    studentInfoForm.classList.add('d-none');
    registerTestBtn.classList.add('d-none');
  }
}

function registerStudentForTest() {
  const selectedTestId = document.getElementById('registerTestSelect').value;
  const studentName = document.getElementById('studentName').value.trim();
  const studentPhone = document.getElementById('studentPhone').value.trim();
  const studentEmail = document.getElementById('studentEmail').value.trim();

  if (!selectedTestId || !studentName || !studentPhone || !studentEmail) {
    showAlert('Please select a test slot and fill in all student details.', 'danger');
    return;
  }

  let testSlots = getData('testSlots');
  let students = getData('students');
  let testRegistrations = getData('testRegistrations');

  const selectedSlot = testSlots.find(slot => slot.id === selectedTestId);

  if (selectedSlot && selectedSlot.availableSeats > 0) {
    let existingStudent = students.find(s => s.phone === studentPhone || s.email === studentEmail);
    let studentId;

    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      studentId = generateUniqueId();
      const newStudent = { id: studentId, name: studentName, phone: studentPhone, email: studentEmail };
      students.push(newStudent);
      saveData('students', students);
    }

    // Check if student is already registered for this specific slot
    const alreadyRegistered = testRegistrations.some(reg => reg.testSlotId === selectedTestId && reg.studentId === studentId);
    if (alreadyRegistered) {
      showAlert('This student is already registered for this test slot.', 'warning');
      return;
    }

    selectedSlot.availableSeats--;
    selectedSlot.registeredStudents.push(studentId); // Store student ID in the slot

    const newRegistration = {
      id: generateUniqueId(),
      studentId: studentId,
      testSlotId: selectedTestId,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    testRegistrations.push(newRegistration);

    saveData('testSlots', testSlots);
    saveData('testRegistrations', testRegistrations);

    showAlert('Student registered successfully!', 'success');
    document.getElementById('studentInfoForm').classList.add('d-none');
    document.getElementById('registerTestBtn').classList.add('d-none');
    document.getElementById('studentName').value = '';
    document.getElementById('studentPhone').value = '';
    document.getElementById('studentEmail').value = '';
    populateTestSlotDropdowns(selectedSlot.type); // Refresh dropdown
    loadTestRegistrations();
  } else {
    showAlert('Selected test slot is full or does not exist.', 'danger');
  }
}

function loadTestRegistrations() {
  const registrations = getData('testRegistrations');
  const testSlots = getData('testSlots');
  const students = getData('students');

  const registrationList = document.getElementById('registrationList');
  registrationList.innerHTML = '';

  if (registrations.length === 0) {
    registrationList.innerHTML = '<li class="list-group-item text-muted">No test registrations yet.</li>';
    return;
  }

  registrations.forEach(reg => {
    const student = students.find(s => s.id === reg.studentId);
    const testSlot = testSlots.find(ts => ts.id === reg.testSlotId);

    if (student && testSlot) {
      const moduleInfo = testSlot.type === 'partial' ? `(${testSlot.module.toUpperCase()})` : '';
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          <strong>${student.name}</strong> (${student.phone})<br>
          <small>${testSlot.type.toUpperCase()} Test ${moduleInfo} on ${testSlot.date} at ${testSlot.time} (Room: ${getData('rooms').find(r => r.id === testSlot.room)?.name})</small><br>
          <small>Registered on: ${reg.registrationDate}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-danger" onclick="deleteRegistration('${reg.id}')">Delete</button>
        </div>
      `;
      registrationList.appendChild(li);
    }
  });
}

function deleteRegistration(id) {
  if (confirm('Are you sure you want to delete this registration?')) {
    let testRegistrations = getData('testRegistrations');
    let testSlots = getData('testSlots');

    const registrationToDelete = testRegistrations.find(reg => reg.id === id);

    if (registrationToDelete) {
      // Increment available seats for the corresponding test slot
      const affectedSlot = testSlots.find(slot => slot.id === registrationToDelete.testSlotId);
      if (affectedSlot) {
        affectedSlot.availableSeats++;
        // Remove student from registeredStudents array in the slot
        affectedSlot.registeredStudents = affectedSlot.registeredStudents.filter(studentId => studentId !== registrationToDelete.studentId);
      }
    }

    testRegistrations = testRegistrations.filter(reg => reg.id !== id);

    saveData('testRegistrations', testRegistrations);
    saveData('testSlots', testSlots); // Save updated test slots
    showAlert('Registration deleted successfully!', 'info');
    loadTestRegistrations();
    // Refresh the test slots in test management and registration forms if visible
    loadTestSlots();
    const currentModule = document.getElementById('registerModuleSelect').value;
    if (currentModule) {
      populateTestSlotDropdowns(currentModule);
    }
  }
}

// ========== STUDENT RECORDS ==========
function loadStudents() {
  const students = getData('students');
  const studentRecordsList = document.getElementById('studentRecordsList');
  studentRecordsList.innerHTML = '';

  if (students.length === 0) {
    studentRecordsList.innerHTML = '<li class="list-group-item text-muted">No students registered yet.</li>';
    return;
  }

  students.forEach(student => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <strong>${student.name}</strong><br>
        <small>Phone: ${student.phone}, Email: ${student.email}</small>
      </div>
      <div>
        <button class="btn btn-sm btn-info me-2" onclick="viewStudentDetails('${student.id}')">View Details</button>
      </div>
    `;
    studentRecordsList.appendChild(li);
  });
}

function viewStudentDetails(studentId) {
  const student = getData('students').find(s => s.id === studentId);
  if (!student) {
    showAlert('Student not found.', 'danger');
    return;
  }

  // Populate student details in modal
  document.getElementById('studentDetailsName').textContent = student.name;
  document.getElementById('studentDetailsPhone').textContent = student.phone;
  document.getElementById('studentDetailsEmail').textContent = student.email;

  // Show registered tests
  const studentTestsList = document.getElementById('studentTestsList');
  studentTestsList.innerHTML = '';
  const registrations = getData('testRegistrations').filter(reg => reg.studentId === studentId);
  const testSlots = getData('testSlots');
  const rooms = getData('rooms');
  const teachers = getData('teachers');

  if (registrations.length === 0) {
    studentTestsList.innerHTML = '<li class="list-group-item text-muted">No registered tests.</li>';
  } else {
    registrations.forEach(reg => {
      const testSlot = testSlots.find(ts => ts.id === reg.testSlotId);
      if (testSlot) {
        const teacherName = teachers.find(t => t.id === testSlot.teacher)?.name || 'N/A';
        const roomName = rooms.find(r => r.id === testSlot.room)?.name || 'N/A';
        const moduleInfo = testSlot.type === 'partial' ? `(${testSlot.module.toUpperCase()})` : '';
        studentTestsList.innerHTML += `
          <li class="list-group-item">
            ${testSlot.type.toUpperCase()} Test ${moduleInfo}: ${testSlot.date} at ${testSlot.time}<br>
            <small>Room: ${roomName}, Teacher: ${teacherName}</small>
          </li>
        `;
      }
    });
  }

  // Show performance records
  const studentPerformanceList = document.getElementById('studentPerformanceList');
  studentPerformanceList.innerHTML = '';
  const performanceRecords = getData('performance').filter(rec => rec.studentId === studentId);

  if (performanceRecords.length === 0) {
    studentPerformanceList.innerHTML = '<li class="list-group-item text-muted">No performance records.</li>';
  } else {
    performanceRecords.forEach(rec => {
      const testSlot = testSlots.find(ts => ts.id === rec.testSlotId);
      if (testSlot) {
        const moduleInfo = testSlot.type === 'partial' ? `(${testSlot.module.toUpperCase()})` : '';
        studentPerformanceList.innerHTML += `
          <li class="list-group-item">
            ${testSlot.type.toUpperCase()} Test ${moduleInfo} on ${testSlot.date}: Score - ${rec.score || 'N/A'}
          </li>
        `;
      }
    });
  }


  const studentDetailsModal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
  studentDetailsModal.show();
}

// ========== ATTENDANCE ==========
function populateAttendanceBatches() {
  const attendanceBatchSelect = document.getElementById('attendanceBatch');
  attendanceBatchSelect.innerHTML = '<option value="">Select Batch</option>';
  const batches = getData('batches');
  batches.forEach(batch => {
    attendanceBatchSelect.innerHTML += `<option value="${batch.id}">${batch.batchNumber}</option>`;
  });
}

function loadAttendance() {
  const attendanceDate = document.getElementById('attendanceDate').value;
  const attendanceBatchId = document.getElementById('attendanceBatch').value;
  const attendanceList = document.getElementById('attendanceList');
  attendanceList.innerHTML = '';

  if (!attendanceDate || !attendanceBatchId) {
    showAlert('Please select both date and batch to load attendance.', 'danger');
    return;
  }

  const attendanceRecords = getData('attendance');
  const students = getData('students'); // Assuming students are registered in batches or can be added to attendance directly

  const batchStudents = getData('testRegistrations') // For simplicity, using test registrations as student source
    .filter(reg => {
      const testSlot = getData('testSlots').find(ts => ts.id === reg.testSlotId);
      // This logic needs to be refined. If attendance is for regular batches,
      // you need a way to link students to batches. For now, let's assume
      // a batch has associated students or we're just listing all students.
      // For a real system, 'batches' would have a 'studentIds' array.
      return true; // For demonstration, consider all students
    })
    .map(reg => students.find(s => s.id === reg.studentId))
    .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i); // Unique students

    // If attendance is tied to batches, you'd filter students based on the batch ID
    // Example: const batch = getData('batches').find(b => b.id === attendanceBatchId);
    // If (batch) { const studentsInBatch = students.filter(s => batch.studentIds.includes(s.id)); }

  if (students.length === 0) {
    attendanceList.innerHTML = '<div class="alert alert-info mt-3">No students to display for attendance.</div>';
    return;
  }

  let attendanceHtml = `
    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Present</th>
          <th>Absent</th>
        </tr>
      </thead>
      <tbody>
  `;

  students.forEach(student => {
    const record = attendanceRecords.find(rec =>
      rec.date === attendanceDate &&
      rec.batchId === attendanceBatchId &&
      rec.studentId === student.id
    );
    const isPresent = record ? record.status === 'present' : false;

    attendanceHtml += `
      <tr>
        <td>${student.name}</td>
        <td>
          <input type="radio" name="attendance_${student.id}" value="present"
                 onclick="saveAttendance('${student.id}', '${attendanceBatchId}', '${attendanceDate}', 'present')"
                 ${isPresent ? 'checked' : ''}>
        </td>
        <td>
          <input type="radio" name="attendance_${student.id}" value="absent"
                 onclick="saveAttendance('${student.id}', '${attendanceBatchId}', '${attendanceDate}', 'absent')"
                 ${!isPresent && record ? 'checked' : (record ? '' : '')}>
        </td>
      </tr>
    `;
  });

  attendanceHtml += `
      </tbody>
    </table>
  `;
  attendanceList.innerHTML = attendanceHtml;
}

function saveAttendance(studentId, batchId, date, status) {
  let attendanceRecords = getData('attendance');
  const existingIndex = attendanceRecords.findIndex(rec =>
    rec.studentId === studentId && rec.batchId === batchId && rec.date === date
  );

  if (existingIndex > -1) {
    attendanceRecords[existingIndex].status = status;
  } else {
    attendanceRecords.push({
      id: generateUniqueId(),
      studentId,
      batchId,
      date,
      status
    });
  }
  saveData('attendance', attendanceRecords);
  showAlert('Attendance saved successfully!', 'success');
}

// ========== PERFORMANCE ==========
function populatePerformanceStudents() {
  const performanceStudentSelect = document.getElementById('performanceStudentSelect');
  performanceStudentSelect.innerHTML = '<option value="">Select Student</option>';
  const students = getData('students'); // Get all registered students
  students.forEach(student => {
    performanceStudentSelect.innerHTML += `<option value="${student.id}">${student.name}</option>`;
  });
}

function loadPerformance() {
  const studentId = document.getElementById('performanceStudentSelect').value;
  const performanceContent = document.getElementById('performanceContent');
  performanceContent.innerHTML = '';

  if (!studentId) {
    showAlert('Please select a student to load performance.', 'danger');
    return;
  }

  const performanceRecords = getData('performance');
  const testSlots = getData('testSlots');

  const studentRecords = performanceRecords.filter(rec => rec.studentId === studentId);

  if (studentRecords.length === 0) {
    performanceContent.innerHTML = '<div class="alert alert-info mt-3">No performance records for this student yet.</div>';
    return;
  }

  let performanceHtml = `
    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>Test Date</th>
          <th>Module / Type</th>
          <th>Score</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  studentRecords.forEach(record => {
    const testSlot = testSlots.find(ts => ts.id === record.testSlotId);
    if (testSlot) {
      const moduleType = testSlot.type === 'partial' ? testSlot.module.toUpperCase() : testSlot.type.toUpperCase();
      performanceHtml += `
        <tr>
          <td>${testSlot.date}</td>
          <td>${moduleType}</td>
          <td>
            <input type="number" class="form-control form-control-sm" value="${record.score || ''}"
                   onchange="saveTestResult('${studentId}', '${testSlot.id}', this.value)">
          </td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="deletePerformanceRecord('${record.id}')">Delete</button>
          </td>
        </tr>
      `;
    }
  });

  performanceHtml += `
      </tbody>
    </table>
  `;
  performanceContent.innerHTML = performanceHtml;
}


function saveTestResult(studentId, testSlotId, score) {
    let performanceRecords = getData('performance');
    let testSlots = getData('testSlots');
    let resultSaved = false;

    // Check if it's a speaking test result stored within testSlots
    const speakingTestSlot = testSlots.find(slot => slot.id === testSlotId && slot.type === 'partial' && slot.module === 'speaking');

  if (speakingTestSlot) {
    // Iterate through the registered students of the speakingTestSlot.
    // The .map() method creates a new array by calling a provided function on every element in the calling array.
    speakingTestSlot.registeredStudents = speakingTestSlot.registeredStudents.map(sSlot => {
        let studentRec; // Declare a variable to hold the student record object

        // Check if sSlot is already an object with an 'id' property, or just a raw student ID.
        // If it's just an ID, transform it into an object with an 'id' and an empty 'result' property.
        if (typeof sSlot === 'object' && sSlot !== null && sSlot.id) {
            studentRec = sSlot; // sSlot is already a valid student object
        } else {
            // Assume sSlot is just the student ID, create a new object structure for consistency.
            studentRec = { id: sSlot, result: '' };
        }

        // Now, check if the current studentRecord's ID matches the studentId we want to update.
        if (studentRec.id === studentId) {
            studentRec.result = score; // Update the result for this specific student.
            resultSaved = true; // Set the flag to indicate a result was saved.
        }

        // Return the (potentially updated) studentRecord for the new registeredStudents array.
        return studentRec;
    });

    // After updating the 'speakingTestSlot' object (which is a reference within 'testSlots'),
    // save the entire 'testSlots' array back to localStorage (or your data store).
    saveData('testSlots', testSlots);

}
// The 'else' block for handling 'performanceRecords' would follow here,
// outside of this 'if (speakingTestSlot)' block, as it was in your full function.
// For example:
else {
    const existingResultIndex = performanceRecords.findIndex(rec => rec.studentId === studentId && rec.testSlotId === testSlotId);

    if (existingResultIndex > -1) {
        performanceRecords[existingResultIndex].score = score;
        resultSaved = true;
    } else {
        performanceRecords.push({
            id: generateUniqueId(),
            studentId: studentId,
            testSlotId: testSlotId,
            score: score
        });
        resultSaved = true;
    }
    saveData('performance', performanceRecords);
}

    if (resultSaved) {
        showAlert('Test result saved successfully!', 'success');
        loadPerformance(); // Refresh performance view
    } else {
        showAlert('Failed to save test result.', 'danger');
    }
}

function deletePerformanceRecord(id) {
  if (confirm('Are you sure you want to delete this performance record?')) {
    let performanceRecords = getData('performance');
    performanceRecords = performanceRecords.filter(record => record.id !== id);
    saveData('performance', performanceRecords);
    showAlert('Performance record deleted successfully!', 'info');
    loadPerformance();
  }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initMockData(); // Initialize localStorage with mock data
  checkInitialPageLoad(); // Check login status and show appropriate page
  updateNavbarForAuth(); // Update navbar visibility based on initial state
});