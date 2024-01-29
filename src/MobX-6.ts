import isEqualWith from 'lodash.isequalwith';
import { observable } from 'mobx';
import { ComponentClass } from 'react';

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
 */
export function observePropsState<T extends ComponentClass<any>>(
    ComponentBaseClass: T
) {
    class ObservedComponent extends (ComponentBaseClass as ComponentClass) {
        @observable
        accessor observedProps = this.props;

        @observable
        accessor observedState = {} as InstanceType<ComponentClass>['state'];

        componentDidMount() {
            this.observedProps = this.props;
            this.observedState = this.state;

            super.componentDidMount?.();
        }

        componentDidUpdate(
            prevProps: Readonly<InstanceType<ComponentClass>['props']>,
            prevState: Readonly<InstanceType<ComponentClass>['state']>,
            snapshot?: any
        ) {
            if (!isEqualProps(prevProps, this.props))
                this.observedProps = this.props;

            if (!isEqualProps(prevState, this.state))
                this.observedState = this.state;

            super.componentDidUpdate?.(prevProps, prevState, snapshot);
        }
    }
    return ObservedComponent as unknown as T;
}
