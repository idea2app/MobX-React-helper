import { computed, IReactionDisposer, observable, reaction, toJS } from 'mobx';
import { createRef, InputHTMLAttributes } from 'react';
import { isEmpty } from 'web-utility';

import { ObservedComponent } from './MobX-6';

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
 * @see {@link https://github.com/idea2app/MobX-React-helper?tab=readme-ov-file#abstract-form-component}
 */
export abstract class FormComponent<
    P extends FormComponentProps<any> = FormComponentProps,
    C = unknown,
    S = {},
    SS = any
> extends ObservedComponent<P, C, S, SS> {
    ref = createRef<HTMLFieldElement>();

    @observable
    accessor innerValue = this.props.defaultValue;

    @computed
    get value(): P['value'] {
        return this.observedProps.value ?? this.innerValue;
    }

    #defaultValueDisposer?: IReactionDisposer;

    #changeEventDisposer?: IReactionDisposer;

    #useDefault = (value: P['value']) => {
        if (!isEmpty(value) && isEmpty(this.innerValue))
            this.innerValue = value;
    };
    emitValue = (value: P['value']) =>
        this.observedProps.onChange?.(
            value && typeof value === 'object' ? toJS(value) : value
        );
    reset = () => (this.innerValue = this.props.defaultValue);

    componentDidMount() {
        this.#defaultValueDisposer = reaction(
            () => this.observedProps.defaultValue,
            this.#useDefault
        );
        this.#changeEventDisposer = reaction(
            () => this.innerValue,
            this.emitValue
        );
        this.ref.current?.form?.addEventListener('reset', this.reset);
    }

    componentWillUnmount() {
        this.#defaultValueDisposer?.();
        this.#defaultValueDisposer = undefined;

        this.#changeEventDisposer?.();
        this.#changeEventDisposer = undefined;

        this.ref.current?.form?.removeEventListener('reset', this.reset);
    }
}
