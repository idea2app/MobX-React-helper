import isEqualWith from 'lodash.isequalwith';
import { observable } from 'mobx';
import { Component } from 'react';

/**
 * @see {@link https://stackoverflow.com/a/73274579}
 */
export const isEqualProps = (a: any, b: any) =>
    isEqualWith(
        a,
        b,
        (a, b, key) =>
            ['_owner', '$$typeof'].includes(key as string) || undefined
    );

/**
 * @see {@link https://github.com/mobxjs/mobx/blob/main/packages/mobx-react/README.md#note-on-using-props-and-state-in-derivations}
 *
 * @example
 * ```tsx
 * import { computed } from 'mobx';
 * import { observer } from 'mobx-react';
 * import { ObservedComponent } from 'mobx-react-helper';
 *
 * export type MyComponentProps = { prefix: string };
 *
 * type State = { text: string };
 *
 * @observer
 * export class MyComponent extends ObservedComponent<
 *     MyComponentProps,
 *     { email: string },
 *     State
 * > {
 *     state: Readonly<State> = { text: '' };
 *
 *     @computed
 *     get decoratedText() {
 *         return (
 *             this.observedProps.prefix +
 *             this.observedState.text +
 *             this.observedContext.email
 *         );
 *     }
 *
 *     render() {
 *         return <p>{this.decoratedText}</p>;
 *     }
 * }
 * ```
 */
export abstract class ObservedComponent<
    Props = {},
    Context = unknown,
    State = {},
    Snapshot = any
> extends Component<Props, State, Snapshot> {
    @observable.shallow
    accessor observedProps = this.props;

    @observable.shallow
    accessor observedState = this.state;

    @observable.shallow
    accessor observedContext = this.context as Context;

    componentDidUpdate(
        prevProps: Readonly<Props>,
        prevState: Readonly<State>,
        snapshot?: Snapshot
    ) {
        if (!isEqualProps(prevProps, this.props))
            this.observedProps = { ...this.props };

        if (!isEqualProps(prevState, this.state))
            this.observedState = { ...this.state };

        super.componentDidUpdate?.(prevProps, prevState, snapshot);
    }
}
