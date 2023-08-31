## MobX React helper

[MobX][1] helper library for [React][2] component engine, with [TypeScript][3] Class & Decorator supports.

[![MobX compatibility](https://img.shields.io/badge/Compatible-1?logo=mobx&label=MobX%204%2F5%2F6)][1]
[![NPM Dependency](https://img.shields.io/librariesio/github/idea2app/MobX-React-helper.svg)][4]
[![CI & CD](https://github.com/idea2app/MobX-React-helper/actions/workflows/main.yml/badge.svg)][5]

[![NPM](https://nodei.co/npm/mobx-react-helper.png?downloads=true&downloadRank=true&stars=true)][6]

## Usage

### Installation

```shell
npm i mobx react \
    mobx-react \
    mobx-react-helper
```

### Configuration

#### `tsconfig.json`

Compatible with MobX 4/5/6:

```json
{
    "compilerOptions": {
        "useDefineForClassFields": false,
        "experimentalDecorators": true,
        "jsx": "react-jsx"
    }
}
```

### Observable Props & State

```tsx
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { observePropsState } from 'mobx-react-helper';
import { Component } from 'react';

export interface MyComponentProps {
    prefix: string;
}

interface State {
    text: string;
}

@observer
@observePropsState
export class MyComponent extends Component<MyComponentProps, State> {
    state: Readonly<State> = {
        text: ''
    };

    declare observedProps: MyComponentProps;
    declare observedState: State;

    @computed
    get decoratedText() {
        return this.observedProps.prefix + this.observedState.text;
    }

    render() {
        return <p>{this.decoratedText}</p>;
    }
}
```

### Abstract Form component

```tsx
import { observer } from 'mobx-react';
import { FormComponent, observePropsState } from 'mobx-react-helper';
import { ChangeEvent } from 'react';

@observer
@observePropsState
export class MyField extends FormComponent {
    handleChange = ({
        currentTarget: { value }
    }: ChangeEvent<HTMLInputElement>) => {
        this.innerValue = value;

        this.props.onChange?.(this.innerValue);
    };

    render() {
        const { onChange, ...props } = this.props,
            { value, handleChange } = this;

        return (
            <>
                <input {...props} onChange={handleChange} />

                <output>{value}</output>
            </>
        );
    }
}
```

[1]: https://mobx.js.org/
[2]: https://react.dev/
[3]: https://www.typescriptlang.org/
[4]: https://libraries.io/npm/mobx-react-helper
[5]: https://github.com/idea2app/MobX-React-helper/actions/workflows/main.yml
[6]: https://nodei.co/npm/mobx-react-helper/
