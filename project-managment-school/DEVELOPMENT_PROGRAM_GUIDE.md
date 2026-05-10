# Development Program Implementation Guide

This document outlines all the new features that have been added to the school management system.

## ✅ Features Implemented

### 1. Period/Session Management System

**Files Created:**

- `src/apiCalls/periodCalls.js` - API calls for managing academic periods
- `src/admins/controlWebsite/PeriodManagement.jsx` - UI component for period management

**Features:**

- Create new academic periods (months/semesters)
- Track active periods
- Close current period and start a new one
- Re-register students for new periods
- View all periods with their status

**Usage:**

```jsx
import PeriodManagement from "./admins/controlWebsite/PeriodManagement";
// Add to your admin panel routes
```

---

### 2. Class Control System

**Files Created:**

- `src/apiCalls/classControlCalls.js` - API calls for controlling class limits

**Features:**

- Control the number of classes per student
- Track attended classes
- Set class limits per group
- Validate if student can attend more classes

**API Functions:**

```javascript
import {
  getStudentClassCount,
  getRemainingClasses,
  canAttendClass,
} from "./apiCalls/classControlCalls";
```

---

### 3. Remaining Classes Display

**Files Created:**

- `src/components/adminsCompnents/groups/RemainingClassesCard.jsx` - UI component

**Features:**

- Show remaining classes in the current month/period
- Visual progress indicator
- Warnings when classes are running low
- Statistics: attended, remaining, and total classes

**Usage:**

```jsx
import RemainingClassesCard from "./components/adminsCompnents/groups/RemainingClassesCard";

// In your component:
<RemainingClassesCard studentId={studentId} />;
```

---

### 4. Receipt Printing System

**Files Created:**

- `src/apiCalls/receiptCalls.js` - API calls for receipt generation
- `src/components/adminsCompnents/Financialmanagement/ReceiptPrint.jsx` - Receipt component

**Features:**

- Professional receipt generation
- PDF export (two methods: React-PDF and jsPDF)
- Support for single and multiple subjects
- Printable format
- Detailed itemization

**Usage:**

```jsx
import ReceiptPrint from "./components/adminsCompnents/Financialmanagement/ReceiptPrint";

const receiptData = {
  receiptNo: "REC-001",
  date: new Date().toISOString(),
  studentName: "John Doe",
  parentName: "Jane Doe",
  paymentMethod: "Cash",
  items: [
    {
      subject: "Mathematics",
      level: "Grade 5",
      classes: 12,
      amount: 150.0,
    },
  ],
  totalAmount: 150.0,
};

<ReceiptPrint receiptData={receiptData} onClose={() => {}} />;
```

---

### 5. Level Schedule Display

**Files Created:**

- `src/admins/classes/LevelSchedule.jsx` - Schedule viewer component

**Features:**

- View class schedule for each educational level
- Weekly timetable view
- Shows subject, teacher, and room for each time slot
- Interactive level selection

**Usage:**

```jsx
import LevelSchedule from "./admins/classes/LevelSchedule";
// Add to your admin routes for schedule management
```

---

### 6. Classroom Availability System

**Files Created:**

- `src/admins/classes/ClassroomAvailability.jsx` - Classroom booking component
- Updated `src/apiCalls/scheduleCalls.js` - Added new API functions

**Features:**

- View available and reserved classrooms
- Real-time availability status
- Book/reserve classrooms
- View classroom capacity and facilities
- Daily schedule for each classroom

**Usage:**

```jsx
import ClassroomAvailability from "./admins/classes/ClassroomAvailability";
// Add to your admin panel for classroom management
```

---

### 7. Multi-Subject Registration

**Files Created:**

- `src/components/adminsCompnents/UsersAndAdditional/MultiSubjectRegistration.jsx`

**Features:**

- Register students for multiple subjects at once
- Generate combined receipt for all subjects
- Visual subject selection with pricing
- Total calculation
- Integrated with receipt printing system

**Usage:**

```jsx
import MultiSubjectRegistration from "./components/adminsCompnents/UsersAndAdditional/MultiSubjectRegistration";

<MultiSubjectRegistration
  studentId={studentId}
  isOpen={isOpen}
  onClose={onClose}
/>;
```

---

### 8. Printable Attendance List

**Files Created:**

- `src/components/adminsCompnents/groups/AttendanceList.jsx` - Paper-friendly attendance list
- `src/apiCalls/attendanceCalls.js` - Attendance API calls

**Features:**

- Print-optimized attendance list
- PDF export functionality
- Manual checkboxes for Present/Absent/Late
- Notes section for each student
- Teacher signature section
- Attendance summary

**Usage:**

```jsx
import AttendanceList from "./components/adminsCompnents/groups/AttendanceList";

const groupData = {
  name: "Math Group A",
  teacher: "Mr. Smith",
  subject: "Mathematics",
  startTime: "09:00",
  endTime: "10:30",
  room: "Room 101",
};

const students = [
  { id: 1, fullName: "John Doe", studentId: "S001" },
  { id: 2, fullName: "Jane Smith", studentId: "S002" },
];

<AttendanceList groupData={groupData} students={students} date={new Date()} />;
```

---

## Backend Requirements

For these features to work fully, your backend should implement the following endpoints:

### Period Management

- `POST /api/periods` - Create new period
- `GET /api/periods` - Get all periods
- `GET /api/periods/active` - Get active period
- `PUT /api/periods/:id` - Update period
- `POST /api/periods/:id/close-and-start-new` - Close and start new
- `POST /api/periods/:id/re-register` - Re-register students

### Class Control

- `GET /api/classes/student/:id/count` - Get class count
- `GET /api/classes/student/:id/remaining` - Get remaining classes
- `PUT /api/groups/:id/class-limit` - Update class limit
- `GET /api/classes/student/:id/can-attend` - Check if can attend

### Receipts

- `GET /api/receipts/:id` - Generate receipt
- `POST /api/receipts/combined` - Generate combined receipt
- `GET /api/receipts/detail/:id` - Get receipt details
- `GET /api/receipts/student/:id` - Get student receipts

### Schedules

- `GET /api/schedules/level/:id` - Get level schedule
- `GET /api/schedules/classrooms/availability` - Get classroom availability
- `POST /api/schedules/classrooms/:id/reserve` - Reserve classroom

### Attendance

- `GET /api/attendance/group/:id` - Get attendance list
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/student/:id/report` - Get attendance report
- `GET /api/attendance/group/:id/stats` - Get attendance stats

---

## Integration Steps

### 1. Add Routes to Your Router

```jsx
// In your Router.jsx or main routing file
import PeriodManagement from './admins/controlWebsite/PeriodManagement';
import LevelSchedule from './admins/classes/LevelSchedule';
import ClassroomAvailability from './admins/classes/ClassroomAvailability';

// Add these routes in your admin section
{
  path: '/admin/periods',
  element: <PeriodManagement />
},
{
  path: '/admin/schedule/levels',
  element: <LevelSchedule />
},
{
  path: '/admin/classrooms',
  element: <ClassroomAvailability />
}
```

### 2. Add Components to Existing Pages

#### In Student Info Page:

```jsx
import RemainingClassesCard from '../components/adminsCompnents/groups/RemainingClassesCard';
import MultiSubjectRegistration from '../components/adminsCompnents/UsersAndAdditional/MultiSubjectRegistration';

// Add to your component:
<RemainingClassesCard studentId={studentId} />
<Button onPress={onOpenMultiSubject}>Register Multiple Subjects</Button>
<MultiSubjectRegistration
  studentId={studentId}
  isOpen={isMultiSubjectOpen}
  onClose={onCloseMultiSubject}
/>
```

#### In Parent Dashboard:

```jsx
import RemainingClassesCard from "../components/adminsCompnents/groups/RemainingClassesCard";

// Show for each child:
{
  children.map((child) => (
    <RemainingClassesCard key={child.id} studentId={child.id} />
  ));
}
```

#### In Group/Class Management:

```jsx
import AttendanceList from '../components/adminsCompnents/groups/AttendanceList';

<Button onPress={onOpenAttendance}>Take Attendance</Button>
<AttendanceList
  groupData={groupData}
  students={students}
  date={selectedDate}
/>
```

### 3. Update Navigation Menu

Add menu items for new features in your sidebar/header:

```jsx
const adminMenuItems = [
  // ... existing items
  {
    title: "Period Management",
    path: "/admin/periods",
    icon: <CalendarIcon />,
  },
  {
    title: "Level Schedules",
    path: "/admin/schedule/levels",
    icon: <ScheduleIcon />,
  },
  {
    title: "Classroom Availability",
    path: "/admin/classrooms",
    icon: <RoomIcon />,
  },
];
```

---

## Environment Variables

Make sure your `.env` file includes:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Dependencies Already Installed

The following packages are already in your project and are used by the new features:

- `@react-pdf/renderer` - For PDF generation
- `jspdf` and `jspdf-autotable` - Alternative PDF generation
- `@nextui-org/react` - UI components
- `axios` - API calls
- `formik` and `yup` - Form handling and validation
- `sweetalert2` - Notifications

---

## Notes

- All components are designed to work with your existing design system (NextUI)
- API URLs use the existing pattern from your project
- Error handling and loading states are included
- All features are responsive and mobile-friendly
- Print styles are optimized for the attendance list

---

## Next Steps

1. Implement the backend endpoints as listed above
2. Add the components to your routing system
3. Integrate the components into existing pages
4. Test each feature thoroughly
5. Customize styling as needed for your brand

---

## Support

If you need help with:

- Backend implementation
- Custom modifications
- Additional features
- Bug fixes

Please refer to the code comments in each file for detailed implementation notes.
