import { computed, IReactionDisposer, observable, reaction } from 'mobx';
import { Component, createRef, InputHTMLAttributes } from 'react';

export type HTMLFieldElement = HTMLInputElement &
    HTMLTextAreaElement &
    HTMLSelectElement;

export interface FormComponentProps<V = string>
    extends Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'defaultValue' | 'value' | 'onChange'
    > {
    defaultValue?: V;
    value?: V;
    onChange?: (value: V, ...extra: any[]) => any;
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
    ref = createRef<HTMLFieldElement>();

    @observable
    accessor innerValue = this.props.defaultValue;

    declare observedProps: P;

    @computed
    get value() {
        return this.observedProps.value ?? this.innerValue;
    }

    protected defaultValueDisposer?: IReactionDisposer;

    protected changeEventDisposer?: IReactionDisposer;

    useDefault = (value: P['value']) => {
        if (value != null && !(this.innerValue != null))
            this.innerValue = value;
    };
    reset = () => (this.innerValue = this.props.defaultValue);

    componentDidMount() {
        this.defaultValueDisposer = reaction(
            () => this.observedProps.defaultValue,
            this.useDefault
        );
        this.changeEventDisposer = reaction(
            () => this.innerValue,
            this.props.onChange
        );
        this.ref.current?.form?.addEventListener('reset', this.reset);
    }

    componentWillUnmount() {
        this.defaultValueDisposer?.();
        this.defaultValueDisposer = undefined;

        this.changeEventDisposer?.();
        this.changeEventDisposer = undefined;

        this.ref.current?.form?.removeEventListener('reset', this.reset);
    }
}
