# React - Từ Cơ Bản Đến Nâng Cao

## Mục Lục

1. [Giới Thiệu React](#1-giới-thiệu-react)
2. [Cơ Bản React](#2-cơ-bản-react)
3. [React Hooks Chi Tiết](#3-react-hooks-chi-tiết)
4. [React Router](#4-react-router)
5. [State Management](#5-state-management)
6. [React 19 - Tính Năng Mới](#6-react-19---tính-năng-mới)
7. [Best Practices & Performance](#7-best-practices--performance)

---

## 1. Giới Thiệu React

### 1.1 React là gì?

React là thư viện JavaScript mã nguồn mở được phát triển bởi Facebook (Meta) dùng để xây dựng giao diện người dùng (UI). React sử dụng mô hình **Component-Based** - chia giao diện thành các component độc lập, có thể tái sử dụng.

**React 19** là phiên bản mới nhất tính đến 2025, ra mắt tháng 4/2024 với nhiều tính năng revolutionary.

### 1.2 Đặc điểm nổi bật của React

| Đặc điểm                   | Mô tả                                                                |
| -------------------------- | -------------------------------------------------------------------- |
| **Virtual DOM**            | React tạo bản sao DOM trong memory, chỉ cập nhật những phần thay đổi |
| **JSX**                    | Viết HTML trong JavaScript, dễ đọc và bảo trì                        |
| **One-Way Data Flow**      | Dữ liệu đi một chiều, dễ debug                                       |
| **Component-Based**        | Tái sử dụng code, maintainability cao                                |
| **Virtual DOM Comparison** | So sánh Virtual DOM với DOM thực, cập nhật hiệu quả                  |

### 1.3 Virtual DOM hoạt động như thế nào?

```
┌─────────────────────────────────────────────────────────────┐
│                        QUY TRÌNH                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. State thay đổi                                        │
│           ↓                                                │
│  2. Tạo Virtual DOM mới (so sánh với cũ)               │
│           ↓                                                │
│  3. React tính toán sự khác biệt (diffing)               │
│           ↓                                                │
│  4. Chỉ cập nhật những gì thay đổi trong Real DOM       │
│           ↓                                                │
│  5. Giao diện được cập nhật                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Cài đặt React với Vite

```bash
# Tạo project mới với Vite (khuyến nghị)
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev

# Hoặc với Yarn
yarn create vite my-app --template react
cd my-app
yarn
yarn dev
```

---

## 2. Cơ Bản React

### 2.1 JSX - JavaScript XML

JSX là cú pháp mở rộng cho phép viết HTML trong JavaScript. JSX tạo ra các React "elements".

```jsx
// Ví dụ JSX cơ bản
function App() {
  const name = "John";
  const isLoggedIn = true;

  return (
    <div className="container">
      <h1>Hello, {name}!</h1>
      <p>Hôm nay là ngày {new Date().toLocaleDateString()}</p>
      {isLoggedIn ? <p>Welcome back!</p> : <p>Please login</p>}
    </div>
  );
}
```

**Quy tắc JSX:**

| Quy tắc              | Ví dụ                                 |
| -------------------- | ------------------------------------- |
| Closing tag          | `<div></div>` hoặc `<input />`        |
| className thay class | `<div className="...">`               |
| Biến trong JSX       | `{variable}`                          |
| camelCase            | `onClick`, `onChange`, `autoComplete` |
| Style object         | `style={{ color: 'red' }}`            |

### 2.2 Components

Component là khối xây dựng cơ bản của React. Có 2 loại chính:

#### Function Components (nên sử dụng)

```jsx
// Function Component cơ bản
function Welcome({ name, age }) {
  return (
    <div className="welcome-card">
      <h1>Xin chào, {name}!</h1>
      <p>Bạn {age} tuổi</p>
    </div>
  );
}

// Arrow function
const Welcome = ({ name, age }) => (
  <div className="welcome-card">
    <h1>Xin chào, {name}!</h1>
    <p>Bạn {age} tuổi</p>
  </div>
);

// Sử dụng component
function App() {
  return (
    <div>
      <Welcome name="Nam" age={25} />
      <Welcome name="Mai" age={30} />
    </div>
  );
}
```

#### Class Components (Legacy - vẫn hỗ trợ)

```jsx
import React from 'react';

class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}

// Sử dụng
<Welcome name="John" />
```

### 2.3 Props - Truyền dữ liệu giữa Components

Props (properties) là cách truyền dữ liệu từ parent component xuống child component.

```jsx
// Parent Component
function Parent() {
  const user = { name: "Nam", age: 25, email: "nam@example.com" };
  return <Child user={user} />;
}

// Child Component - nhận props
function Child({ user, defaultValue = "N/A" }) {
  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <p>Email: {user.email || defaultValue}</p>
    </div>
  );
}

// Destructuring props
function Child({ user: { name, age }, title = "User" }) {
  return <h1>{title}: {name}, {age} tuổi</h1>;
}
```

**Lưu ý quan trọng về Props:**

- Props là **read-only** (chỉ đọc)
- Props truyền từ trên xuống (one-way data flow)
- Có thể đặt default values

### 2.4 Conditional Rendering - Hiển thị có điều kiện

```jsx
function UserProfile({ user, isAdmin }) {
  return (
    <div>
      {/* If-else với ternary operator */}
      {user ? (
        <div>
          <h1>Welcome, {user.name}!</h1>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <h1>Please login</h1>
      )}

      {/* Logical AND - hiển thị khi điều kiện đúng */}
      {isAdmin && <button>Delete Post</button>}
      {isAdmin && <button>Edit Post</button>}

      {/* Switch case với object */}
      {{
        admin: <AdminPanel />,
        editor: <EditorPanel />,
        user: <UserPanel />,
        guest: <GuestPanel />
      }[user?.role] || <DefaultPanel />}

      {/* Immediately Invoked Function Expression (IIFE) */}
      {(() => {
        if (user?.role === 'admin') return <AdminPanel />;
        if (user?.role === 'editor') return <EditorPanel />;
        return <UserPanel />;
      })()}
    </div>
  );
}
```

### 2.5 Lists và Keys - Hiển thị danh sách

```jsx
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <UserCard user={user} />
        </li>
      ))}
    </ul>
  );
}

// Key phải là unique identifier
// ✅ GOOD: key={user.id}
// ❌ BAD: key={index} (trừ khi danh sách không thay đổi)

// Nếu không có id, có thể tạo
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={todo.id || `todo-${index}`}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

### 2.6 Events - Xử lý sự kiện

```jsx
function EventExample() {
  function handleClick(event) {
    console.log("Button clicked!", event);
    console.log("Event type:", event.type);
  }

  function handleInputChange(event) {
    console.log("Input value:", event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault(); // Ngăn form submit
    console.log("Form submitted");
  }

  return (
    <div>
      {/* Click event */}
      <button onClick={handleClick}>Click me</button>

      {/* Input change */}
      <input onChange={handleInputChange} placeholder="Type here..." />

      {/* Form submit */}
      <form onSubmit={handleSubmit}>
        <input name="email" />
        <button type="submit">Submit</button>
      </form>

      {/* Arrow function inline */}
      <button onClick={() => alert("Hello!")}>Alert</button>

      {/* Event với tham số */}
      <button onClick={(e) => handleClickWithParam("test", e)}>With Param</button>
    </div>
  );
}
```

### 2.7 State - Quản lý dữ liệu động

State là dữ liệu thay đổi theo thời gian trong component.

```jsx
import { useState } from 'react';

function Counter() {
  // Khai báo state: [state, setState]
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "John", age: 25 });

  return (
    <div>
      <p>Count: {count}</p>

      {/* Cập nhật state */}
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev + 1)}>Increment (callback)</button>
      <button onClick={() => setCount(0)}>Reset</button>

      {/* Cập nhật object - PHẢI tạo bản mới */}
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        Tăng tuổi
      </button>

      <p>{user.name} - {user.age} tuổi</p>
    </div>
  );
}
```

**Nguyên tắc quan trọng:**

- State là **immutable** - không bao giờ mutate trực tiếp
- Dùng callback khi state phụ thuộc state trước đó
- Với object/array: luôn tạo bản sao mới (spread operator)

---

## 3. React Hooks Chi Tiết

### 3.1 useState - Quản lý State

**Cú pháp:**

```jsx
const [state, setState] = useState(initialState)
```

**Tham số:**

| Tham số        | Mô tả                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `initialState` | Giá trị khởi tạo. Có thể là bất kỳ type nào. Nếu là function, React chỉ gọi một lần khi khởi tạo. |

**Giá trị trả về:**

- `state`: Giá trị hiện tại
- `setState`: Function để cập nhật state và trigger re-render

**Ví dụ chi tiết:**

```jsx
import { useState } from 'react';

function FormExample() {
  // State cơ bản
  const [name, setName] = useState("");

  // State với object
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });

  // State với array
  const [items, setItems] = useState([]);

  // State với function initializer (chỉ gọi 1 lần)
  const [expensiveValue] = useState(() => {
    // Chỉ chạy 1 lần khi mount
    return computeExpensiveValue(props.count);
  });

  // Cập nhật string
  const handleNameChange = (e) => setName(e.target.value);

  // Cập nhật object (phải spread!)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Cập nhật array
  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), text: "New item" }]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <form>
      <input value={name} onChange={handleNameChange} placeholder="Name" />

      <input
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email"
      />

      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Password"
      />

      <label>
        <input
          name="remember"
          type="checkbox"
          checked={formData.remember}
          onChange={handleInputChange}
        />
        Remember me
      </label>

      <button type="button" onClick={addItem}>Add Item</button>
      <ul>
        {items.map(item => (
          <li key={item.id} onClick={() => removeItem(item.id)}>
            {item.text}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

### 3.2 useEffect - Xử lý Side Effects

**Cú pháp:**

```jsx
useEffect(setup, dependencies?)
```

**Tham số:**

| Tham số        | Mô tả                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `setup`        | Function chứa logic effect. Có thể trả về cleanup function.                                              |
| `dependencies` | Mảng chứa các reactive values (props, state, variables). Effect chạy khi bất kỳ dependency nào thay đổi. |

**Cách hoạt động:**

```
┌─────────────────────────────────────────────────────────────┐
│                    VÒNG ĐỜI USE EFFECT                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Mount:        Setup chạy khi component vào DOM      │
│                                                             │
│  2. Update:       Cleanup (với giá trị cũ) → Setup mới   │
│                                                             │
│  3. Unmount:      Cleanup chạy một lần cuối               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Ví dụ chi tiết:**

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Chạy sau MỖI render (không có dependency)
  useEffect(() => {
    console.log("Component rendered!");
  });

  // 2. Chỉ chạy 1 LẦN khi mount (empty dependency)
  useEffect(() => {
    console.log("Component mounted!");

    // Cleanup khi unmount
    return () => {
      console.log("Component will unmount!");
    };
  }, []);

  // 3. Chạy khi userId thay đổi
  useEffect(() => {
    console.log("userId changed:", userId);
  }, [userId]);

  // 4. Fetch data từ API
  useEffect(() => {
    let ignore = false;

    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const data = await response.json();

        if (!ignore) {
          setUser(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (userId) {
      fetchUser();
    }

    // Cleanup: prevent setState nếu component unmount
    return () => {
      ignore = true;
    };
  }, [userId]);

  // 5. Subscribe vào external service
  useEffect(() => {
    const subscription = api.connect(userId);

    return () => {
      // Cleanup: disconnect khi unmount hoặc khi userId thay đổi
      subscription.disconnect();
    };
  }, [userId]);

  // 6. Listen browser events
  useEffect(() => {
    function handleResize() {
      console.log("Window resize:", window.innerWidth);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{user?.name}</div>;
}
```

**Bảng Dependency Array:**

| Array    | Khi nào chạy              |
| -------- | ------------------------- |
| `[]`     | Chỉ 1 lần khi mount       |
| `[a, b]` | Khi `a` hoặc `b` thay đổi |
| Không có | Sau MỖI render            |

### 3.3 useContext - Global State

**Cú pháp:**

```jsx
const value = useContext(SomeContext)
```

**Mục đích:** Truy cập context mà không cần prop drilling (truyền props qua nhiều tầng).

**Ví dụ chi tiết:**

```jsx
import { createContext, useContext, useState } from 'react';

// 1. Tạo Context với default value
const ThemeContext = createContext('light');
const AuthContext = createContext(null);
const LanguageContext = createContext('vi');

// 2. Provider - cung cấp giá trị cho component tree
function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState({ name: "John", role: "admin" });

  return (
    <AuthContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <LanguageContext.Provider value="vi">
          <MainApp />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// 3. Sử dụng useContext trong bất kỳ component nào
function Header() {
  const theme = useContext(ThemeContext);
  const user = useContext(AuthContext);
  const lang = useContext(LanguageContext);

  return (
    <header className={`header-${theme}`}>
      <h1>Welcome {user?.name}</h1>
      <p>Language: {lang}</p>
    </header>
  );
}

// 4. Overriding context cho một phần tree
function SpecialSection() {
  return (
    <ThemeContext.Provider value="light">
      <ThisSectionWillUseLightTheme />
    </ThemeContext.Provider>
  );
}
```

**Lưu ý quan trọng:**

- Context chỉ hoạt động với Provider phía trên trong tree
- Khi context value thay đổi, tất cả component dùng useContext sẽ re-render
- Sử dụng `useMemo` để tránh re-render không cần thiết

```jsx
// Tối ưu performance với useMemo
function App() {
  const [user, setUser] = useState(null);

  const contextValue = useMemo(() => ({
    user,
    setUser
  }), [user]);

  return (
    <AuthContext.Provider value={contextValue}>
      <Component />
    </AuthContext.Provider>
  );
}
```

### 3.4 useReducer - Complex State Management

**Cú pháp:**

```jsx
const [state, dispatch] = useReducer(reducer, initialArg, init?)
```

**Khi nào dùng useReducer:**

- State có logic phức tạp với nhiều sub-values
- State tiếp theo phụ thuộc state trước đó
- Cần tách logic ra khỏi component

**Ví dụ chi tiết:**

```jsx
import { useReducer } from 'react';

// Initial state
const initialState = {
  count: 0,
  step: 1,
  history: []
};

// Reducer function - phải là pure function
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, { type: 'INCREMENT', newCount: state.count + state.step }]
      };

    case 'DECREMENT':
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, { type: 'DECREMENT', newCount: state.count - state.step }]
      };

    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'RESET':
      return initialState;

    case 'UNDO':
      if (state.history.length === 0) return state;
      const previous = state.history[state.history.length - 1];
      return {
        ...state,
        count: previous.type === 'INCREMENT'
          ? state.count - state.step
          : state.count + state.step,
        history: state.history.slice(0, -1)
      };

    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Step: {state.step}</p>

      <button onClick={() => dispatch({ type: 'INCREMENT' })}>
        +{state.step}
      </button>

      <button onClick={() => dispatch({ type: 'DECREMENT' })}>
        -{state.step}
      </button>

      <button onClick={() => dispatch({ type: 'SET_STEP', payload: 10 })}>
        Set Step = 10
      </button>

      <button onClick={() => dispatch({ type: 'UNDO' })}>
        Undo
      </button>

      <button onClick={() => dispatch({ type: 'RESET' })}>
        Reset
      </button>

      <ul>
        {state.history.map((h, i) => (
          <li key={i}>{h.type}: {h.newCount}</li>
        ))}
      </ul>
    </div>
  );
}
```

**useReducer với initializer function:**

```jsx
// Tránh tính toán lại initial state mỗi lần render
function init(initialCount) {
  return { count: initialCount };
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
}
```

### 3.5 useMemo - Memoize Giá Trị

**Cú pháp:**

```jsx
const cachedValue = useMemo(calculateValue, dependencies)
```

**Mục đích:** Cache kết quả tính toán, tránh tính toán lại không cần thiết.

**Khi nào dùng:**

- Tính toán tốn kém (expensive computation)
- Truyền làm prop cho `memo`-wrapped component
- Làm dependency cho hooks khác

**Ví dụ chi tiết:**

```jsx
import { useMemo } from 'react';

function TodoList({ todos, filter, sortBy }) {
  // Chỉ tính lại khi todos hoặc filter thay đổi
  const filteredTodos = useMemo(() => {
    console.log("Filtering todos...");
    return todos
      .filter(todo => todo.text.toLowerCase().includes(filter.toLowerCase()))
      .filter(todo => !todo.completed || filter === 'all');
  }, [todos, filter]);

  // Chỉ tính lại khi filteredTodos hoặc sortBy thay đổi
  const sortedTodos = useMemo(() => {
    console.log("Sorting todos...");
    const sorted = [...filteredTodos];

    if (sortBy === 'text') {
      sorted.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return sorted;
  }, [filteredTodos, sortBy]);

  // Tính toán derived data
  const total = useMemo(() => filteredTodos.length, [filteredTodos]);
  const completed = useMemo(() => filteredTodos.filter(t => t.completed).length, [filteredTodos]);

  return (
    <div>
      <p>Total: {total}, Completed: {completed}</p>
      <ul>
        {sortedTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.6 useCallback - Memoize Functions

**Cú pháp:**

```jsx
const cachedFn = useCallback(fn, dependencies)
```

**Mục đích:** Cache function definition, tránh tạo lại function mỗi khi render.

**Khi nào dùng:**

- Truyền callback làm prop cho `memo`-wrapped component
- Callback là dependency cho `useEffect`, `useMemo`

```jsx
import { useCallback, useState, memo } from 'react';

// Component con được memoize
const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log("TodoItem rendered:", todo.id);
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  // KHÔNG dùng useCallback - function mới mỗi render
  const handleToggle1 = (id) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // DÙNG useCallback - function được memoize
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }, []); // Empty deps - function ổn định

  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
```

**So sánh useMemo và useCallback:**

```jsx
// useMemo caches KẾT QUẢ của function
const result = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback caches CHÍNH FUNCTION đó
const handleClick = useCallback(() => doSomething(a, b), [a, b]);

// Hai cách này TƯƠNG ĐƯƠNG:
const handleClick1 = useMemo(() => () => doSomething(a, b), [a, b]);
const handleClick2 = useCallback(() => doSomething(a, b), [a, b]);
```

### 3.7 useRef - Tham chiếu DOM và Mutable Values

**Cú pháp:**

```jsx
const ref = useRef(initialValue)
```

**Đặc điểm:**

- `ref.current` có thể thay đổi được (mutable)
- Thay đổi `ref.current` KHÔNG trigger re-render
- Persist giữa các lần render

**Ví dụ chi tiết:**

```jsx
import { useRef, useEffect, useState } from 'react';

function TextInput() {
  const inputRef = useRef(null);    // DOM reference
  const countRef = useRef(0);       // Mutable value
  const [text, setText] = useState("");

  useEffect(() => {
    // Focus input khi component mount
    inputRef.current.focus();
  }, []);

  function handleClick() {
    // Access DOM element
    inputRef.current.value = "Hello!";
    inputRef.current.focus();

    // Lưu giá trị KHÔNG gây re-render
    countRef.current++;
    console.log("Clicks:", countRef.current);
  }

  function handleSelect() {
    // Select text trong input
    inputRef.current.select();
  }

  return (
    <div>
      <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleClick}>Set Value & Count</button>
      <button onClick={handleSelect}>Select All</button>
    </div>
  );
}
```

**So sánh useState và useRef:**

| useState             | useRef                             |
| -------------------- | ---------------------------------- |
| Thay đổi → re-render | Thay đổi → KHÔNG re-render         |
| Dùng cho UI updates  | Dùng cho values không ảnh hưởng UI |
| Immutable            | Mutable                            |

**Ref callback với cleanup:**

```jsx
function Example() {
  const [isInView, setIsInView] = useState(false);

  return (
    <div
      ref={(el) => {
        if (el) {
          // Setup
          const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
          });
          observer.observe(el);

          // Cleanup function
          return () => observer.disconnect();
        }
      }}
    >
      Content
    </div>
  );
}
```

### 3.8 Custom Hooks - Tái sử dụng Logic

Custom Hook là function bắt đầu bằng "use", có thể gọi các hooks khác.

```jsx
// Custom Hook: useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Sử dụng
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [name, setName] = useLocalStorage('name', '');

  return (
    <div>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme: {theme}
      </button>
      <input value={name} onChange={e => setName(e.target.value)} />
    </div>
  );
}
```

```jsx
// Custom Hook: useFetch
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (!ignore) {
          setData(json);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, loading, error };
}

// Sử dụng
function UserList() {
  const { data, loading, error } = useFetch('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

```jsx
// Custom Hook: useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // API call chỉ chạy khi debouncedQuery thay đổi
  const { data } = useFetch(`/api/search?q=${debouncedQuery}`);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <Results data={data} />
    </div>
  );
}
```

### 3.9 useTransition và useDeferredValue

**useTransition** - Đánh dấu state updates là transitions:

```jsx
import { useState, useTransition } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  function handleChange(e) {
    const value = e.target.value;

    // Cập nhật input NGAY LẬP TỨC
    setQuery(value);

    // Cập nhật results với lower priority
    startTransition(() => {
      setResults(search(value));
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </div>
  );
}
```

**useDeferredValue** - Trì hoãn giá trị:

```jsx
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);

  // expensive filtering
  const results = useMemo(
    () => filterExpensive(deferredQuery),
    [deferredQuery]
  );

  return (
    <div style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
      {results.map(r => <div key={r.id}>{r.name}</div>)}
    </div>
  );
}
```

---

## 4. React Router

### 4.1 Cài đặt

```bash
npm install react-router-dom
```

### 4.2 Basic Routing

```jsx
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users">Users</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />

        {/* Redirect */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4.3 Dynamic Routes và Parameters

```jsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function UserDetail() {
  const { id } = useParams();           // Lấy parameter từ URL
  const navigate = useNavigate();       // Điều hướng
  const location = useLocation();        // Lấy thông tin URL hiện tại

  return (
    <div>
      <h1>User ID: {id}</h1>
      <p>Path: {location.pathname}</p>

      <button onClick={() => navigate('/users')}>Back to Users</button>
      <button onClick={() => navigate(-1)}>Go Back</button>
      <button onClick={() => navigate(1)}>Go Forward</button>
    </div>
  );
}

// Routes với parameters
<Route path="/users/:id" element={<UserDetail />} />
<Route path="/posts/:year/:month/:day" element={<PostDate />} />
```

### 4.4 Nested Routes

```jsx
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="users" element={<Users />}>
          <Route path=":id" element={<UserDetail />} />
          <Route path="new" element={<NewUser />} />
        </Route>
      </Route>
    </Routes>
  );
}

function Layout() {
  return (
    <div>
      <header>My App</header>
      <main>
        <Outlet /> {/* Render child routes tại đây */}
      </main>
      <footer>Footer</footer>
    </div>
  );
}
```

### 4.5 Protected Routes

```jsx
import { Navigate, useLocation } from 'react-router-dom';

// Component bảo vệ route
function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect về login, lưu vị trí hiện tại để quay lại sau
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Route với role-based access
function RoleRoute({ allowedRoles, userRole, children }) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Sử dụng
function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <RoleRoute allowedRoles={['admin']} userRole={user?.role}>
              <AdminPanel />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### 4.6 Data Loading với useLoaderData (React Router 7)

```jsx
import { useLoaderData, RouterProvider, createBrowserRouter } from 'react-router-dom';

// Loader function - chạy trước khi route render
async function loader({ params }) {
  const response = await fetch(`/api/users/${params.id}`);
  return response.json();
}

// Component nhận data từ loader
function UserProfile() {
  const user = useLoaderData();

  return <h1>{user.name}</h1>;
}

// Định nghĩa router
const router = createBrowserRouter([
  {
    path: '/users/:id',
    loader,
    element: <UserProfile />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}
```

---

## 5. State Management

### 5.1 Vấn đề Prop Drilling

```jsx
// ❌ Problem: Props phải đi qua nhiều tầng không cần thiết
function App() {
  const [user, setUser] = useState(null);
  return <Header user={user} />;
}

function Header({ user }) {
  return <Nav user={user} />;
}

function Nav({ user }) {
  return <UserAvatar user={user} />;
}

function UserAvatar({ user }) {
  return <img src={user?.avatar} />;
}

// ✅ Giải pháp: Context
```

### 5.2 Context + useReducer Pattern

```jsx
// store/StoreContext.js
import { createContext, useContext, useReducer } from 'react';

const StoreContext = createContext(null);

// Initial state
const initialState = {
  user: null,
  theme: 'light',
  notifications: [],
  cart: []
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    default:
      return state;
  }
}

// Provider
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Custom hook
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}

// Selector hook
export function useSelector(selector) {
  const { state } = useStore();
  return selector(state);
}

// Action creators
export const actions = {
  setUser: (user) => ({ type: 'SET_USER', payload: user }),
  setTheme: (theme) => ({ type: 'SET_THEME', payload: theme }),
  addNotification: (message, type = 'info') => ({
    type: 'ADD_NOTIFICATION',
    payload: { id: Date.now(), message, type }
  }),
  addToCart: (product) => ({ type: 'ADD_TO_CART', payload: product }),
};
```

```jsx
// Sử dụng
import { useStore, useSelector, actions } from './store/StoreContext';

function UserAvatar() {
  const user = useSelector(state => state.user);
  return user ? <img src={user.avatar} /> : <LoginButton />;
}

function ThemeToggle() {
  const { dispatch } = useStore();
  const theme = useSelector(state => state.theme);

  return (
    <button onClick={() => dispatch(actions.setTheme(theme === 'light' ? 'dark' : 'light'))}>
      Toggle Theme
    </button>
  );
}
```

### 5.3 Redux Toolkit (Nâng cao)

```bash
npm install @reduxjs/toolkit react-redux
```

```jsx
// store/store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
    }
  }
});

export const { setUser, setLoading, setError, logout } = userSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer
  }
});
```

```jsx
// Sử dụng trong component
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout } from './store';

function UserProfile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.user);

  const handleLogin = async (credentials) => {
    dispatch(setLoading(true));
    try {
      const response = await api.login(credentials);
      dispatch(setUser(response.user));
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : user ? (
        <div>
          <h1>Welcome, {user.name}</h1>
          <button onClick={() => dispatch(logout())}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}
```

---

## 6. React 19 - Tính Năng Mới

### 6.1 use() Hook

`use()` cho phép đọc Promise và Context trực tiếp trong component body.

```jsx
import { use } from 'react';

// Đọc Promise resolution
function UserProfile({ userPromise }) {
  const user = use(userPromise); // Suspends until resolved

  return <h1>{user.name}</h1>;
}

// Đọc Context có điều kiện (sau early return)
function Heading({ children }) {
  if (children == null) return null;

  const theme = use(ThemeContext); // Works where useContext doesn't

  return <h1 style={{ color: theme.color }}>{children}</h1>;
}

// Sử dụng với async component
async function getUser(id) {
  const res = await fetch(`/users/${id}`);
  return res.json();
}

function App() {
  const userPromise = getUser(1);
  return <UserProfile userPromise={userPromise} />;
}
```

### 6.2 Actions và useActionState

```jsx
import { useActionState, useTransition } from 'react';

async function createUser(formData) {
  const name = formData.get('name');
  const email = formData.get('email');

  const res = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name, email })
  });

  if (!res.ok) {
    return { error: 'Failed to create user' };
  }

  return { success: true, userId: '123' };
}

function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" type="text" required placeholder="Name" />
      <input name="email" type="email" required placeholder="Email" />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>

      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state?.success && <p style={{ color: 'green' }}>User created!</p>}
    </form>
  );
}
```

### 6.3 useOptimistic - Optimistic Updates

```jsx
import { useOptimistic } from 'react';

function LikeButton({ initialLikes, onLike }) {
  const [likes, setOptimisticLikes] = useOptimistic(
    initialLikes,
    (state, newLike) => state + newLike
  );

  async function handleClick() {
    setOptimisticLikes(1); // Cập nhật NGAY LẬP TỨC

    // Gọi server
    await onLike();
  }

  return (
    <button onClick={handleClick}>
      👍 {likes}
    </button>
  );
}

// Với form submission
function CommentForm() {
  const [optimisticComment, setOptimisticComment] = useOptimistic(
    null,
    (state, newComment) => newComment
  );

  async function handleSubmit(formData) {
    const text = formData.get('comment');

    // Optimistic update
    setOptimisticComment({ text, pending: true });

    // Server call
    await submitComment(text);
  }

  return (
    <form action={handleSubmit}>
      <textarea name="comment" />
      <button type="submit">Submit</button>

      {optimisticComment && (
        <div className="pending">{optimisticComment.text}</div>
      )}
    </form>
  );
}
```

### 6.4 useFormStatus và useFormAction

```jsx
import { useFormStatus, useFormAction } from 'react-dom';

// Đọc trạng thái của parent form
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

// Form với action
function MyForm() {
  return (
    <form action="/api/submit">
      <input name="text" />
      <SubmitButton />
    </form>
  );
}
```

### 6.5 Server Components và Server Actions

```jsx
// Server Component - chỉ chạy ở server
// (Trong Next.js App Router hoặc React Server Components)

async function UserList() {
  // Query database trực tiếp - KHÔNG gọi API
  const users = await db.users.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Server Action - gọi từ client
'use server';

async function updateUser(id, data) {
  await db.users.update({
    where: { id },
    data
  });
  revalidatePath('/users');
}

// Client Component gọi Server Action
'use client';

function EditUser({ user }) {
  async function update(formData) {
    'use server';
    await updateUser(user.id, Object.fromEntries(formData));
  }

  return (
    <form action={update}>
      <input name="name" defaultValue={user.name} />
      <button type="submit">Update</button>
    </form>
  );
}
```

### 6.6 Ref as Prop

```jsx
// Function components có thể nhận ref như prop - KHÔNG cần forwardRef
function MyInput({ placeholder, ref }) {
  return <input ref={ref} placeholder={placeholder} />;
}

function App() {
  const inputRef = useRef(null);

  return <MyInput ref={inputRef} placeholder="Type here..." />;
}
```

### 6.7 Context as Provider

```jsx
// React 19: Render <Context> thay vì <Context.Provider>
function App() {
  return (
    <ThemeContext value="dark">
      <MainContent />
    </ThemeContext>
  );
}
```

### 6.8 Document Metadata

```jsx
// Tự động render metadata vào <head>
function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <meta name="author" content={post.author} />
      <link rel="canonical" href={post.url} />

      {/* Open Graph */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.summary} />

      <div>{post.content}</div>
    </article>
  );
}
```

### 6.9 Resource Preloading

```jsx
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom';

function MyComponent() {
  return (
    <div>
      {/* Preconnect to server */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Preload font */}
      <link
        rel="preload"
        href="/fonts/my-font.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Preload script */}
      <script src="/app.js" async />

      {/* Hoặc dùng APIs */}
      {preconnect('https://api.example.com')}
      {preload('/fonts/my-font.woff2', { as: 'font' })}
      {preinit('/scripts/app.js', { as: 'script' })}
    </div>
  );
}
```

---

## 7. Best Practices & Performance

### 7.1 Component Design

```jsx
// ✅ Tách component nhỏ, single responsibility
function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="card">
      <Avatar src={user.avatar} />
      <UserInfo name={user.name} email={user.email} />
      <UserActions
        onEdit={() => onEdit(user.id)}
        onDelete={() => onDelete(user.id)}
      />
    </div>
  );
}

// ✅ Default props với destructuring
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// ✅ Composition pattern
function Card({ header, children, footer }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
```

### 7.2 Performance Optimization

```jsx
import { memo, useMemo, useCallback } from 'react';

// React.memo - Skip re-render nếu props không đổi
const UserCard = memo(function UserCard({ user, onSelect }) {
  return (
    <div onClick={() => onSelect(user.id)}>
      {user.name}
    </div>
  );
});

// Virtualization cho danh sách dài
import { FixedSizeList } from 'react-window';

function UserList({ users }) {
  const Row = useCallback(({ index, style }) => (
    <div style={style}>{users[index].name}</div>
  ), [users]);

  return (
    <FixedSizeList height={400} itemCount={users.length} itemSize={50}>
      {Row}
    </FixedSizeList>
  );
}

// Code splitting
import { lazy, Suspense } const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 7.3 Error Handling

```jsx
import { Component, useState } from 'react';

// Error Boundary (Class Component)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Gửi error lên logging service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Sử dụng
function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}

// Error handling với try-catch trong useEffect
function useSafeAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setState(s => ({ ...s, loading: true }));
        const data = await asyncFn();

        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
```

### 7.4 Security

```jsx
// ✅ Sanitize user input trước khi render HTML
import DOMPurify from 'dompurify';

function Comment({ content }) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ✅ Validate data
function UserForm({ onSubmit }) {
  const [errors, setErrors] = useState({});

  function validate(data) {
    const errors = {};

    if (!data.name || data.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email address';
    }

    if (!data.password || data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    return errors;
  }

  function handleSubmit(formData) {
    const data = Object.fromEntries(formData);
    const errors = validate(data);

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      {errors.name && <span>{errors.name}</span>}
      {/* ... */}
    </form>
  );
}
```

---

## Tổng Kết

### Kiến Thức Cơ Bản

- ✅ JSX và Component
- ✅ Props và State
- ✅ useState và useEffect
- ✅ Conditional Rendering và Lists
- ✅ Events và Forms

### Kiến Thức Nâng Cao

- ✅ useContext cho global state
- ✅ useReducer cho complex state
- ✅ useMemo và useCallback cho performance
- ✅ useRef cho DOM và mutable values
- ✅ Custom Hooks
- ✅ React Router (Basic đến Protected Routes)
- ✅ State Management (Context, Redux Toolkit)

### React 19

- ✅ use() hook
- ✅ Actions và useActionState
- ✅ useOptimistic
- ✅ Server Components
- ✅ Server Actions
- ✅ Ref as Prop
- ✅ Context as Provider
- ✅ Document Metadata
- ✅ Resource Preloading

---

## Tài Liệu Tham Khảo

| Tài liệu                   | URL                                           |
| -------------------------- | --------------------------------------------- |
| React Documentation        | https://react.dev                             |
| React API Reference        | https://react.dev/reference/react             |
| React Router Documentation | https://reactrouter.com                       |
| Redux Toolkit              | https://redux-toolkit.js.org                  |
| React 19 Release Notes     | https://react.dev/blog/2024/04/25/react-19    |
| useState Reference         | https://react.dev/reference/react/useState    |
| useEffect Reference        | https://react.dev/reference/react/useEffect   |
| useContext Reference       | https://react.dev/reference/react/useContext  |
| useReducer Reference       | https://react.dev/reference/react/useReducer  |
| useMemo Reference          | https://react.dev/reference/react/useMemo     |
| useCallback Reference      | https://react.dev/reference/react/useCallback |
| useRef Reference           | https://react.dev/reference/react/useRef      |

---

*Bài giảng được viết và tổng hợp từ React Documentation chính thức (https://react.dev) - Phiên bản React 19*
