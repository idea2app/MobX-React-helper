import isEqualWith from 'lodash.isequalwith';
import { IReactionPublic, observable, reaction as watch } from 'mobx';
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

export type ReactionExpression<I = any, O = any> = (
    data: I,
    reaction: IReactionPublic
) => O;

export type ReactionEffect<V> = (
    newValue: V,
    oldValue: V,
    reaction: IReactionPublic
) => any;

interface ReactionItem {
    expression: ReactionExpression;
    effect: (...data: any[]) => any;
}
const reactionMap = new WeakMap<ObservedComponent, ReactionItem[]>();
/**
 * Method decorator of [MobX `reaction()`](https://mobx.js.org/reactions.html#reaction)
 *
 * (this is a clone from [WebCell `@reaction`](https://web-cell.dev/WebCell/functions/reaction.html))
 *
 * @example
 * ```tsx
 * import { observable } from 'mobx';
 * import { observer } from 'mobx-react';
 * import { ObservedComponent, reaction } from 'mobx-react-helper';
 *
 * @observer
 * export class MyComponent extends ObservedComponent {
 *     @observable
 *     accessor count = 0;
 *
 *     @reaction(({ count }) => count)
 *     handleCountChange(newValue: number, oldValue: number) {
 *         console.log(`Count changed from ${oldValue} to ${newValue}`);
 *     }
 *
 *     render() {
 *        return (
 *            <button onClick={() => this.count++}>
 *                Up count {this.count}
 *            </button>
 *        );
 *    }
 * }
 * ```
 */
export const reaction =
    <C extends ObservedComponent, V>(expression: ReactionExpression<C, V>) =>
    (
        effect: ReactionEffect<V>,
        { addInitializer }: ClassMethodDecoratorContext<C>
    ) =>
        addInitializer(function () {
            const reactions = reactionMap.get(this) || [];

            reactions.push({ expression, effect });

            reactionMap.set(this, reactions);
        });

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

    #disposers = reactionMap
        .get(this)
        ?.map(({ expression, effect }) =>
            watch(reaction => expression(this, reaction), effect.bind(this))
        );
    componentWillUnmount() {
        this.#disposers?.forEach(disposer => disposer());
    }

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
