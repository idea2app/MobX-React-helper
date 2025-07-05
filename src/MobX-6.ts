import isEqualWith from 'lodash.isequalwith';
import {
    IReactionDisposer,
    IReactionPublic,
    observable,
    reaction as watch
} from 'mobx';
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
 * @see {@link https://github.com/idea2app/MobX-React-helper?tab=readme-ov-file#observable-reaction-decorator}
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
 * @see {@link https://github.com/idea2app/MobX-React-helper?tab=readme-ov-file#observable-props-state--context}
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

    #disposers?: IReactionDisposer[];

    componentDidMount() {
        this.#disposers = reactionMap
            .get(this)
            ?.map(({ expression, effect }) =>
                watch(reaction => expression(this, reaction), effect.bind(this))
            );
    }
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
