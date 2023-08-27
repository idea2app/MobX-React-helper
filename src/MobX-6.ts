import * as MobX from 'mobx';
import eq from 'lodash.eq';
import { ComponentClass } from 'react';

/**
 * @see {@link https://github.com/mobxjs/mobx/blob/main/packages/mobx-react/README.md#note-on-using-props-and-state-in-derivations}
 */
export function observePropsState<T extends ComponentClass>(
    ComponentBaseClass: T
) {
    class ObservedComponent extends (ComponentBaseClass as ComponentClass) {
        constructor(props: InstanceType<ComponentClass>['props']) {
            super(props);
            MobX.makeObservable?.(this);
        }

        @MobX.observable
        observedProps = this.props;

        @MobX.observable
        observedState = {} as InstanceType<ComponentClass>['state'];

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
            if (!eq(prevProps, this.props)) this.observedProps = this.props;

            if (!eq(prevState, this.state)) this.observedState = this.state;

            super.componentDidUpdate?.(prevProps, prevState, snapshot);
        }
    }
    return ObservedComponent as unknown as T;
}
