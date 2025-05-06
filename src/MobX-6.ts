import isEqualWith from 'lodash.isequalwith';
import { observable } from 'mobx';
import { Component, ComponentClass } from 'react';

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
export interface ObservedComponent<Props, Context, State, Snapshot>
    extends Component<Props, State, Snapshot> {
    observedProps: Props;
    observedState: State;
    observedContext?: Context;
}

/**
 * @see {@link https://github.com/mobxjs/mobx/blob/main/packages/mobx-react/README.md#note-on-using-props-and-state-in-derivations}
 *
 * @example
 * ```tsx
 * import { computed } from 'mobx';
 * import { observer } from 'mobx-react';
 * import { observePropsState, ObservedComponent } from 'mobx-react-helper';
 * import { Component } from 'react';
 *
 * export type MyComponentProps = { prefix: string };
 *
 * type State = { text: string };
 *
 * @observer
 * @observePropsState
 * export class MyComponent
 *     extends Component<MyComponentProps, State>
 *     implements ObservedComponent<MyComponentProps, { email: string }, State>
 * {
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
export function observePropsState<T extends ComponentClass<any>>(
    ComponentBaseClass: T,
    {}: ClassDecoratorContext
) {
    class ObservedComponent extends (ComponentBaseClass as ComponentClass) {
        @observable.shallow
        accessor observedProps = this.props;

        @observable.shallow
        accessor observedState = this.state;

        @observable.shallow
        accessor observedContext = this.context;

        componentDidUpdate(
            prevProps: Readonly<InstanceType<ComponentClass>['props']>,
            prevState: Readonly<InstanceType<ComponentClass>['state']>,
            snapshot?: any
        ) {
            if (!isEqualProps(prevProps, this.props))
                this.observedProps = { ...this.props };

            if (!isEqualProps(prevState, this.state))
                this.observedState = { ...this.state };

            super.componentDidUpdate?.(prevProps, prevState, snapshot);
        }
    }
    return ObservedComponent as unknown as T;
}
