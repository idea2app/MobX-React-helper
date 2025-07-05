## MobX React helper

[MobX][1] helper library for [React][2] component engine, with [TypeScript][3] Class & Decorator supports.

[![MobX compatibility](https://img.shields.io/badge/Compatible-1?logo=mobx&label=MobX%206%2F7)][1]
[![NPM Dependency](https://img.shields.io/librariesio/github/idea2app/MobX-React-helper.svg)][4]
[![CI & CD](https://github.com/idea2app/MobX-React-helper/actions/workflows/main.yml/badge.svg)][5]

[![NPM](https://nodei.co/npm/mobx-react-helper.png?downloads=true&downloadRank=true&stars=true)][6]

## Versions

| SemVer  |    status    |      ES decorator      |    MobX     |
| :-----: | :----------: | :--------------------: | :---------: |
| `>=0.4` | ✅developing | stage-3 (internal use) |  `>=6.11`   |
| `0.3.x` | ❌deprecated |        stage-3         |  `>=6.11`   |
| `<0.3`  | ❌deprecated |        stage-2         | `>=4 <6.11` |

## Usage

### Installation

```shell
npm i mobx react \
    mobx-react \
    mobx-react-helper
```

### Configuration

#### `tsconfig.json`

Compatible with MobX 6/7:

```json
{
    "compilerOptions": {
        "target": "ES6",
        "moduleResolution": "Node",
        "useDefineForClassFields": true,
        "experimentalDecorators": false,
        "jsx": "react-jsx"
    }
}
```

### Observable Props, State & Context

#### `source/index.tsx`

```tsx
import { createRoot } from 'react-dom/client';

import { MyComponent } from './Component';
import { session, MyContext } from './store';

createRoot(document.body).render(
    <MyContext.Provider value={session}>
        <MyComponent />
    </MyContext.Provider>
);
```

#### `source/store.ts`

```tsx
import { createContext } from 'react';

export const session = { email: 'tech-query@idea2.app' };

export const MyContext = createContext(session);
```

#### `source/Component.tsx`

```tsx
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent } from 'mobx-react-helper';

import { session } from './store';

export type MyComponentProps = { prefix: string };

type State = { text: string };

@observer
export class MyComponent extends ObservedComponent<
    MyComponentProps,
    { email: string },
    State
> {
    state: Readonly<State> = { text: '' };

    @computed
    get decoratedText() {
        return (
            this.observedProps.prefix +
            this.observedState.text +
            this.observedContext.email
        );
    }

    render() {
        return <p>{this.decoratedText}</p>;
    }
}
```

### Observable Reaction decorator

```tsx
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent, reaction } from 'mobx-react-helper';

@observer
export class MyComponent extends ObservedComponent {
    @observable
    accessor count = 0;

    componentDidMount() {
        super.componentDidMount();
        // Super method call is required if you have more "did mount" logic below
        // Your logic is here...
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        // Super method call is required if you have more "will unmount" logic below
        // Your logic is here...
    }

    @reaction(({ count }) => count)
    handleCountChange(newValue: number, oldValue: number) {
        console.log(`Count changed from ${oldValue} to ${newValue}`);
    }

    render() {
        return (
            <button onClick={() => this.count++}>Up count {this.count}</button>
        );
    }
}
```

### Abstract Form component

```tsx
import { observer } from 'mobx-react';
import { FormComponent } from 'mobx-react-helper';

@observer
export class MyField extends FormComponent {
    render() {
        const { onChange, ...props } = this.props,
            { value, handleChange } = this;

        return (
            <>
                <input
                    {...props}
                    onChange={({ currentTarget: { value } }) =>
                        (this.innerValue = value)
                    }
                />
                <output>{value}</output>
            </>
        );
    }
}
```

## User case

1. Super Table & Form: https://github.com/idea2app/MobX-RESTful-table
2. React Bootstrap extra: https://github.com/idea2app/Idea-React
3. Open Street Map: https://github.com/idea2app/OpenReactMap

[1]: https://mobx.js.org/
[2]: https://react.dev/
[3]: https://www.typescriptlang.org/
[4]: https://libraries.io/npm/mobx-react-helper
[5]: https://github.com/idea2app/MobX-React-helper/actions/workflows/main.yml
[6]: https://nodei.co/npm/mobx-react-helper/
