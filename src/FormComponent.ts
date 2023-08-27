import * as MobX from 'mobx';
import { Component, InputHTMLAttributes, createRef } from 'react';

export interface FormComponentProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onChange?: (
        value: InputHTMLAttributes<HTMLInputElement>['value'],
        ...extra: any[]
    ) => any;
}

/**
 * @example
 * ```tsx
 * import { ChangeEvent } from 'react';
 * import { observer } from 'mobx-react';
 * import { FormComponent, observePropsState } from 'mobx-react-helper';
 *
 * @observer
 * @observePropsState
 * export class MyField extends FormComponent {
 *     handleChange = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
 *         this.innerValue = value;
 *
 *         this.props.onChange?.(this.innerValue);
 *     };
 *
 *     render() {
 *         const { onChange, ...props } = this.props,
 *             { value, handleChange } = this;
 *
 *         return <>
 *             <input {...props} onChange={handleChange} />
 *
 *             <output>{value}</output>
 *         </>;
 *     }
 * }
 * ```
 */
export abstract class FormComponent<
    P extends FormComponentProps = FormComponentProps,
    S = {},
    SS = any
> extends Component<P, S, SS> {
    constructor(props: P) {
        super(props);
        MobX.makeObservable?.(this);
    }

    ref = createRef<
        HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement
    >();

    @MobX.observable
    innerValue = this.props.defaultValue;

    declare observedProps: P;

    @MobX.computed
    get value() {
        return this.observedProps.value ?? this.innerValue;
    }

    reset = () => {
        this.innerValue = this.props.defaultValue;

        this.props.onChange?.(this.innerValue);
    };

    componentDidMount() {
        this.ref.current?.form?.addEventListener('reset', this.reset);
    }

    componentWillUnmount() {
        this.ref.current?.form?.removeEventListener('reset', this.reset);
    }
}
