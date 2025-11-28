<!-- src/components/battle/Battle.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { BattleCharacter, Move, MoveEffect, Stat, StatusInstance } from './types/types';
    import { getCharacter } from './characters';

    const BASE_W = 240;
    const BASE_H = 160;
    const TILE_SIZE = 8;

    const tile = (t: number) => t * TILE_SIZE;

    type Turn = 'player' | 'enemy';

    const createBattlePair = (): { player: BattleCharacter; enemy: BattleCharacter } => {
        const player = getCharacter('andres');
        const enemy = getCharacter('abraham');
        return { player, enemy };
    };

    // Helper to force uppercase names everywhere
    const NAME = (n: string) => n.toUpperCase();

    let { player, enemy } = createBattlePair();
    let turn: Turn = 'player';
    let battleOver = false;
    let log: string[] = [];

    // IMPORTANT: we start with moves disabled; intro text will show first
    let canSelectMove = false;

    // Battle start transition state
    let battleStarting = true;
    let transitionPhase: 'flash' | 'swipe-in' | 'show-enemy' | 'send-out' | 'complete' = 'flash';
    let transitionTimeouts: number[] = [];
    let flashCount = 0;

    // Track scheduled enemy turns so we can cancel them on reset
    let enemyTurnTimeout: number | null = null;

    // --- Typewriter state / queue ---
    let displayedText: string[] = ['', '']; // what the player sees (2 lines max)
    let currentlyTyping = false;
    const CHAR_DELAY = 30; // ms per character (medium)
    const PAGE_HOLD_MS = 1200; // pause after full page so it can be read
    let typewriterGeneration = 0; // used to cancel older runs
    let messageQueue: string[] = []; // pending messages to show, in order
    let queueIdleResolvers: Array<() => void> = [];

    const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    function resolveQueueIdle() {
        const resolvers = [...queueIdleResolvers];
        queueIdleResolvers = [];
        resolvers.forEach((r) => r());
    }

    function waitForQueueToDrain(): Promise<void> {
        if (!currentlyTyping && messageQueue.length === 0) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            queueIdleResolvers.push(resolve);
        });
    }

    // Wrap log updates so they trigger the typewriter queue
    function pushLog(message: string) {
        log = [...log, message];
        messageQueue.push(message);

        // If nothing is currently typing, start consuming the queue
        if (!currentlyTyping) {
            runMessageQueue();
        }
    }

    // Consume the messageQueue in pages of up to 2 lines
    async function runMessageQueue() {
        const myGen = ++typewriterGeneration;
        currentlyTyping = true;

        while (myGen === typewriterGeneration && messageQueue.length > 0) {
            // Take up to 2 messages as one "page"
            const page: string[] = [];
            page.push(messageQueue.shift() as string);
            if (messageQueue.length > 0) {
                page.push(messageQueue.shift() as string);
            }

            displayedText = ['', ''];

            const maxLines = page.length;
            for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
                const msg = page[lineIndex] ?? '';

                for (let charIndex = 0; charIndex <= msg.length; charIndex++) {
                    if (myGen !== typewriterGeneration) {
                        // A newer run started (e.g., resetBattle), abort this one
                        return;
                    }

                    displayedText[lineIndex] = msg.substring(0, charIndex);
                    displayedText = [...displayedText]; // trigger Svelte reactivity

                    await delay(CHAR_DELAY);
                }
            }

            // Hold the fully-typed page on screen for a moment so it can be read
            if (myGen !== typewriterGeneration) {
                return;
            }
            await delay(PAGE_HOLD_MS);
        }

        if (myGen === typewriterGeneration) {
            currentlyTyping = false;
            resolveQueueIdle();
        }
    }

    function getEffectiveStat(character: BattleCharacter, stat: Stat): number {
        let base = character[stat];
        for (const status of character.statuses) {
            if (status.type === 'statModifier' && status.stat === stat) {
                base += status.amount ?? 0;
            }
        }
        return Math.max(1, base);
    }

    function calculateDamage(attacker: BattleCharacter, defender: BattleCharacter, basePower: number, isCrit: boolean): number {
        const atk = getEffectiveStat(attacker, 'attack');
        const def = getEffectiveStat(defender, 'defense');

        let dmg = basePower + atk - def;
        if (dmg < 1) dmg = 1;
        if (isCrit) {
            dmg = Math.floor(dmg * 1.5);
        }
        return dmg;
    }

    function applyStatusesEndOfRound(char: BattleCharacter): void {
        if (battleOver) return;

        const newStatuses: StatusInstance[] = [];

        for (const status of char.statuses) {
            if (status.type === 'damageOverTime') {
                const before = char.currentHp;
                const perTurn = status.power ?? 0;
                char.currentHp = Math.max(0, char.currentHp - perTurn);
                const actual = before - char.currentHp;

                if (actual > 0) {
                    pushLog(`${NAME(char.name)} is hurt by ${status.label} for ${actual} damage!`);
                }

                status.remainingTurns -= 1;

                if (char.currentHp <= 0 && !battleOver) {
                    pushLog(`${NAME(char.name)} fainted!`);
                    battleOver = true;
                    continue;
                }

                if (status.remainingTurns > 0) {
                    newStatuses.push(status);
                } else {
                    pushLog(`${NAME(char.name)} is no longer ${status.label}.`);
                }
            } else if (status.type === 'statModifier') {
                status.remainingTurns -= 1;
                if (status.remainingTurns > 0) {
                    newStatuses.push(status);
                } else {
                    pushLog(`${NAME(char.name)}'s ${status.label} wore off.`);
                }
            }
        }

        char.statuses = newStatuses;

        if (char === player) {
            player = { ...player };
        } else if (char === enemy) {
            enemy = { ...enemy };
        }
    }

    function applyEffect(effect: MoveEffect, move: Move, attacker: BattleCharacter, defender: BattleCharacter, isCrit: boolean) {
        if (battleOver) return;

        const target = effect.target === 'self' ? attacker : defender;

        if (effect.type === 'instantDamage') {
            const basePower = effect.power ?? 0;
            const dmg = calculateDamage(attacker, target, basePower, isCrit);
            const before = target.currentHp;
            target.currentHp = Math.max(0, target.currentHp - dmg);
            const actual = before - target.currentHp;

            if (target === player) {
                player = { ...player };
            } else if (target === enemy) {
                enemy = { ...enemy };
            }

            pushLog(`${NAME(attacker.name)}'s ${move.name} hit for ${actual} damage${isCrit ? ' (CRIT)!' : '!'}`);

            if (target.currentHp <= 0 && !battleOver) {
                pushLog(`${NAME(target.name)} fainted!`);
                battleOver = true;
            }
        } else if (effect.type === 'instantHeal') {
            const amount = effect.power ?? 0;
            const before = target.currentHp;
            target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
            const healed = target.currentHp - before;

            if (target === player) {
                player = { ...player };
            } else if (target === enemy) {
                enemy = { ...enemy };
            }

            pushLog(`${NAME(attacker.name)} used ${move.name} and recovered ${healed} HP.`);
        } else if (effect.type === 'damageOverTime') {
            const perTurn = effect.power ?? 0;
            const duration = effect.duration ?? 1;

            target.statuses = [
                ...target.statuses,
                {
                    type: 'damageOverTime',
                    sourceMoveId: move.id,
                    label: 'poisoned',
                    power: perTurn,
                    remainingTurns: duration,
                },
            ];

            if (target === player) {
                player = { ...player };
            } else if (target === enemy) {
                enemy = { ...enemy };
            }

            pushLog(`${NAME(target.name)} was afflicted by ${move.name}!`);
        } else if (effect.type === 'statModifier') {
            const duration = effect.duration ?? 1;
            const amount = effect.amount ?? 0;
            const stat = effect.stat ?? 'defense';

            target.statuses = [
                ...target.statuses,
                {
                    type: 'statModifier',
                    sourceMoveId: move.id,
                    label: stat === 'defense' ? 'defense change' : 'attack change',
                    stat,
                    amount,
                    remainingTurns: duration,
                },
            ];

            if (target === player) {
                player = { ...player };
            } else if (target === enemy) {
                enemy = { ...enemy };
            }

            if (amount < 0) {
                pushLog(`${NAME(target.name)}'s ${stat} fell!`);
            } else if (amount > 0) {
                pushLog(`${NAME(target.name)}'s ${stat} rose!`);
            } else {
                pushLog(`${move.name} changed ${NAME(target.name)}'s ${stat}.`);
            }
        }
    }

    function applyMoveWithEffects(attacker: BattleCharacter, defender: BattleCharacter, move: Move) {
        if (battleOver) return;

        const isCrit = Math.random() < move.critChance;

        for (const effect of move.effects) {
            applyEffect(effect, move, attacker, defender, isCrit);
            if (battleOver) break;
        }
    }

    // Make this async so we can await the queue
    async function handlePlayerMove(move: Move) {
        if (battleOver || turn !== 'player' || !canSelectMove) return;

        // Disable input while text is playing
        canSelectMove = false;

        applyMoveWithEffects(player, enemy, move);

        // Wait for player's move text to finish before proceeding
        await waitForQueueToDrain();

        if (battleOver) {
            return;
        }

        // Clear any previous enemy turn timeout just in case
        if (enemyTurnTimeout !== null) {
            clearTimeout(enemyTurnTimeout);
            enemyTurnTimeout = null;
        }

        // Now it's the enemy's turn (with a small delay like original)
        turn = 'enemy';
        enemyTurnTimeout = window.setTimeout(() => {
            enemyTurnTimeout = null;
            enemyTurn();
        }, 800);
    }

    // Make enemy turn async so we can wait for all its messages
    async function enemyTurn() {
        if (battleOver) return;

        const move = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];

        applyMoveWithEffects(enemy, player, move);
        if (battleOver) {
            await waitForQueueToDrain();
            return;
        }

        applyStatusesEndOfRound(player);
        applyStatusesEndOfRound(enemy);

        if (!battleOver && player.currentHp <= 0) {
            pushLog(`${NAME(player.name)} fainted!`);
            battleOver = true;
        } else if (!battleOver && enemy.currentHp <= 0) {
            pushLog(`${NAME(enemy.name)} fainted!`);
            battleOver = true;
        }

        // Wait until all enemy + status messages have fully displayed
        await waitForQueueToDrain();

        if (!battleOver) {
            turn = 'player';
            canSelectMove = true;
        }
    }

    // Intro sequence: only runs once transitions are complete
    function beginBattleIntro() {
        // Reset text / queue state
        typewriterGeneration++;
        resolveQueueIdle();
        log = [];
        messageQueue = [];
        displayedText = ['', ''];
        currentlyTyping = false;
        canSelectMove = false;

        // 1) A wild [ENEMY] appeared!
        pushLog(`A wild ${NAME(enemy.name)} appeared!`);

        // When first message fully done, then:
        waitForQueueToDrain()
            .then(() => {
                if (battleOver) return;
                // 2) Go [PLAYER]!
                pushLog(`Go, ${NAME(player.name)}!`);
                return waitForQueueToDrain();
            })
            .then(() => {
                if (!battleOver) {
                    canSelectMove = true;
                }
            });
    }

    function startBattleTransition(onComplete?: () => void) {
        // Clear any existing timeouts
        for (const id of transitionTimeouts) {
            clearTimeout(id);
        }
        transitionTimeouts = [];

        // Also clear any scheduled enemy turn from a previous battle
        if (enemyTurnTimeout !== null) {
            clearTimeout(enemyTurnTimeout);
            enemyTurnTimeout = null;
        }

        battleStarting = true;
        transitionPhase = 'flash';
        flashCount = 0;

        // Flash 3 times
        const flashDuration = 250;
        const totalFlashes = 3;

        for (let i = 0; i < totalFlashes; i++) {
            transitionTimeouts.push(
                window.setTimeout(() => {
                    flashCount = i + 1;
                }, i * flashDuration),
            );
        }

        // Start swipe after flashes complete
        const swipeStartTime = totalFlashes * flashDuration;

        transitionTimeouts.push(
            window.setTimeout(() => {
                transitionPhase = 'swipe-in';
            }, swipeStartTime),
        );

        transitionTimeouts.push(
            window.setTimeout(() => {
                transitionPhase = 'show-enemy';
            }, swipeStartTime + 600),
        );

        transitionTimeouts.push(
            window.setTimeout(() => {
                transitionPhase = 'send-out';
            }, swipeStartTime + 1200),
        );

        transitionTimeouts.push(
            window.setTimeout(() => {
                transitionPhase = 'complete';
                battleStarting = false;
                if (onComplete) onComplete();
            }, swipeStartTime + 2000),
        );
    }

    function resetBattle() {
        const fresh = createBattlePair();
        player = fresh.player;
        enemy = fresh.enemy;
        battleOver = false;
        turn = 'player';
        canSelectMove = false;

        // Hard clear any pending enemy turn for the old battle
        if (enemyTurnTimeout !== null) {
            clearTimeout(enemyTurnTimeout);
            enemyTurnTimeout = null;
        }

        startBattleTransition(() => {
            beginBattleIntro();
        });
    }

    $: playerHpPercent = Math.max(0, Math.min(100, (player.currentHp / player.maxHp) * 100));
    $: enemyHpPercent = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));

    let scaleWrapper: HTMLDivElement | null = null;
    let outerEl: HTMLDivElement | null = null;

    function resizeScreen() {
        if (!scaleWrapper || !outerEl) return;

        const rect = outerEl.getBoundingClientRect();
        const availW = rect.width;
        const availH = rect.height;

        const safeW = availW - 8;
        const safeH = availH - 8;

        const scaleW = Math.floor(safeW / BASE_W);
        const scaleH = Math.floor(safeH / BASE_H);

        const scale = Math.max(1, Math.min(scaleW, scaleH));

        scaleWrapper.style.setProperty('--scale', String(scale));
    }

    onMount(() => {
        // Start transitions, then run intro text
        startBattleTransition(() => {
            beginBattleIntro();
        });

        resizeScreen();
        window.addEventListener('resize', resizeScreen);
        return () => {
            window.removeEventListener('resize', resizeScreen);
            for (const id of transitionTimeouts) {
                clearTimeout(id);
            }
            if (enemyTurnTimeout !== null) {
                clearTimeout(enemyTurnTimeout);
            }
        };
    });
</script>

<div class="outer" bind:this={outerEl}>
    <div class="scale-wrapper" bind:this={scaleWrapper}>
        <div class="screen">
            {#if battleStarting}
                <!-- White flash overlay (3 flashes) -->
                {#if transitionPhase === 'flash'}
                    <div class="flash-overlay" class:flash-active={flashCount % 2 === 1}></div>
                {/if}

                <!-- Battle start transition overlay (swipe stripes) -->
                {#if transitionPhase === 'swipe-in'}
                    <div class="transition-overlay">
                        <div class="transition-stripe"></div>
                        <div class="transition-stripe"></div>
                        <div class="transition-stripe"></div>
                        <div class="transition-stripe"></div>
                        <div class="transition-stripe"></div>
                    </div>
                {/if}
            {/if}

            <!-- Fade in once we're past the flash and swipe phases -->
            <div class="battle-field" class:fade-in={transitionPhase !== 'flash' && transitionPhase !== 'swipe-in'}>
                <!-- Enemy HP Box -->
                <div class="hp-box enemy" style="left: {tile(2)}px; top: {tile(2)}px;">
                    <div class="name">{NAME(enemy.name)}</div>
                    <div class="hp-bar-container">
                        <div class="hp-label">HP</div>
                        <div class="hp-bar-outer">
                            <div class="hp-bar-inner" class:hp-green={enemyHpPercent > 50} class:hp-yellow={enemyHpPercent > 25 && enemyHpPercent <= 50} class:hp-red={enemyHpPercent <= 25} style:width={enemyHpPercent + '%'}></div>
                        </div>
                    </div>
                </div>

                <!-- Enemy Sprite -->
                <div class="sprite" style="left: {tile(18)}px; top: {tile(2)}px; width: 64px; height: 64px;">
                    <img src={enemy.sprite} alt={NAME(enemy.name)} />
                </div>

                <!-- Player Sprite -->
                <div class="sprite sprite-flipped" style="left: {tile(2)}px; top: {tile(6)}px; width: 64px; height: 64px;">
                    <img src={player.sprite} alt={NAME(player.name)} />
                </div>

                <!-- Player HP Box -->
                <div class="hp-box player" style="right: {tile(2)}px; top: {tile(9)}px;">
                    <div class="name">{NAME(player.name)}</div>
                    <div class="hp-bar-container">
                        <div class="hp-label">HP</div>
                        <div class="hp-bar-outer">
                            <div class="hp-bar-inner" class:hp-green={playerHpPercent > 50} class:hp-yellow={playerHpPercent > 25 && playerHpPercent <= 50} class:hp-red={playerHpPercent <= 25} style:width={playerHpPercent + '%'}></div>
                        </div>
                    </div>
                    <div class="hp-numbers">{player.currentHp} / {player.maxHp}</div>
                </div>
            </div>

            <div class="battle-ui" class:fade-in={transitionPhase !== 'flash' && transitionPhase !== 'swipe-in'}>
                <div class="text-box">
                    <div class="text-box-inner">
                        <div class="text-box-inner-secondary">
                            {#if battleStarting}
                                <!-- Completely blank textbox during transitions -->
                            {:else if battleOver}
                                {#if player.currentHp > 0}
                                    <p>Victory!<br /><span class="uppercase">{NAME(enemy.name)}</span> fainted!</p>
                                {:else}
                                    <p>You lost!<br /><span class="uppercase">{NAME(player.name)}</span> fainted!</p>
                                {/if}
                            {:else if turn === 'player' && canSelectMove}
                                <p>What will<br /><span class="uppercase">{NAME(player.name)}</span> do?</p>
                            {:else}
                                {#each displayedText as line, i}
                                    <p>
                                        {line}
                                        {#if i === displayedText.length - 1 && currentlyTyping}
                                            <span class="cursor">▼</span>
                                        {/if}
                                    </p>
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>

                {#if battleOver}
                    <div class="overlay-menu overlay-menu-single secondary-textbox">
                        <div class="secondary-textbox-inner">
                            <button on:click={resetBattle}>New Battle</button>
                        </div>
                    </div>
                {:else if turn === 'player' && canSelectMove}
                    <div class="overlay-menu secondary-textbox">
                        <div class="secondary-textbox-inner">
                            <div class="move-grid">
                                {#each player.moves as move}
                                    <button on:click={() => handlePlayerMove(move)}>{move.name}</button>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    @font-face {
        font-family: 'PokemonEmerald';
        src: url('public/fonts/pokemon-emerald.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
    }

    :global(html, body) {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }

    .outer {
        height: 100vh;
        width: 100%;
        background: black;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .scale-wrapper {
        width: 240px;
        height: 160px;
        transform: scale(var(--scale, 4));
        transform-origin: center center;
    }

    .screen {
        width: 240px;
        height: 160px;
        background: white;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        position: relative;
        font-family: 'PokemonEmerald', monospace;
        font-size: 8px;
    }

    .uppercase {
        text-transform: uppercase;
    }

    .battle-field {
        position: relative;
        height: 112px;
        background-image: url('/public/battle_background.png');
        background-size: 240px 112px;
        background-position: center center;
        background-repeat: no-repeat;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.4s ease-in;
    }

    .battle-field.fade-in {
        opacity: 1;
    }

    .sprite {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        z-index: 2;
    }

    .sprite img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    .sprite-flipped img {
        transform: scaleX(-1);
    }

    .hp-box {
        position: absolute;
        z-index: 2;
        background-image: url('/public/hp_gradient.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center;
        width: 84px;
        padding: 3px;
        border: 2px solid #283030;
        border-top-left-radius: 8px;
        border-top-right-radius: 3px;
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 3px;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        box-shadow: 0 0 0 1px #fff;
    }

    .name {
        font-weight: normal;
        font-size: 10px;
        text-transform: uppercase;
        line-height: 8px;
    }

    .hp-bar-container {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0;
    }

    .hp-label {
        font-size: 5px;
        height: 5.5px;
        font-weight: bold;
        color: #f8b800;
        background-color: #283030;
        border-top-left-radius: 2px;
        border-bottom-left-radius: 2px;
        padding: 0 2px;
        display: flex;
        align-items: center;
        margin-right: -2px;
    }

    .hp-bar-outer {
        width: 48px;
        height: 4px;
        border: 1px solid #283030;
        background: linear-gradient(to bottom, #606060 0%, #484848 100%);
        margin-left: 0;
        border-radius: 1px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .hp-bar-inner {
        height: 100%;
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-sizing: border-box;
        transition:
            width 0.3s ease,
            background-color 0.3s ease;
    }

    .hp-green {
        background: linear-gradient(to bottom, #58f858 0%, #30c820 100%);
    }

    .hp-yellow {
        background: linear-gradient(to bottom, #f8d858 0%, #f0b030 100%);
    }

    .hp-red {
        background: linear-gradient(to bottom, #f85050 0%, #d82020 100%);
    }

    .hp-numbers {
        font-size: 8px;
        line-height: 8px;
        text-align: right;
    }

    .battle-ui {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 48px;
        background: #000;
        z-index: 3;
        box-sizing: border-box;
        opacity: 0;
        transition: opacity 0.4s ease-in;
    }

    .battle-ui.fade-in {
        opacity: 1;
    }

    .text-box {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 48px;
        display: flex;
        background-color: #283030;
        padding: 1px;
        box-sizing: border-box;
        overflow: hidden;
    }

    .text-box-inner {
        flex: 1;
        display: flex;
        border-radius: 6px;
        background-color: #fff;
        border: 2px solid #c8a848;
        padding: 2px;
        box-sizing: border-box;
    }

    .text-box-inner-secondary {
        flex: 1;
        border-radius: 3px;
        background-color: #285068;
        font-size: 14px;
        line-height: 16px;
        padding: 2px 4px;
        color: #fff;
    }

    .text-box p {
        margin: 0;
    }

    .overlay-menu {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 120px;
        height: 48px;
        z-index: 4;
        box-sizing: border-box;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
        pointer-events: auto;
    }

    .overlay-menu-single {
        padding: 4px;
        justify-content: center;
        align-items: center;
    }

    .overlay-menu-single button {
        width: 100%;
        height: 100%;
    }

    .secondary-textbox {
        background-color: #283030;
        padding: 1px;
    }

    .secondary-textbox-inner {
        background: #fff;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border: 2px solid #706880;
        border-radius: 3px;
    }

    .move-grid {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        box-sizing: border-box;
        padding: 4px;
    }

    button {
        font-size: 12px;
        line-height: 16px;
        cursor: pointer;
        font-family: 'PokemonEmerald', monospace;
        padding: 1px 2px;
        box-sizing: border-box;
        text-align: left;
        text-transform: uppercase;
        border: 0;
        background-color: transparent;
    }

    button:hover {
        background: #f0f0f0;
    }

    /* Battle start transition styles */
    .flash-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 7; /* on top of everything including swipe */
        background: black;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.05s ease-in-out;
    }

    .flash-overlay.flash-active {
        background: white;
        opacity: 1;
    }

    .transition-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 6; /* always on top of everything else */
        display: flex;
        flex-direction: column;
        background: transparent;
        pointer-events: none;
    }

    .transition-stripe {
        flex: 1;
        background: black;
        transform: translateX(100%);
        animation: swipeOut 0.6s ease-out forwards;
    }

    .transition-stripe:nth-child(1) {
        animation-delay: 0s;
    }
    .transition-stripe:nth-child(2) {
        animation-delay: 0.05s;
    }
    .transition-stripe:nth-child(3) {
        animation-delay: 0.1s;
    }
    .transition-stripe:nth-child(4) {
        animation-delay: 0.15s;
    }
    .transition-stripe:nth-child(5) {
        animation-delay: 0.2s;
    }

    @keyframes swipeOut {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-100%);
        }
    }

    /* Typewriter cursor */
    .cursor {
        animation: blink 0.8s infinite;
        margin-left: 2px;
    }

    @keyframes blink {
        0%,
        49% {
            opacity: 1;
        }
        50%,
        100% {
            opacity: 0;
        }
    }
</style>
