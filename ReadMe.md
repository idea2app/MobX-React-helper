## MobX React helper

[MobX][1] helper library for [React][2] component engine, with [TypeScript][3] Class & Decorator supports.

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

### Abstract Form component

```tsx
import { ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { FormComponent, observePropsState } from 'mobx-react-helper';

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
