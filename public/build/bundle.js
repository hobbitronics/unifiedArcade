
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const MATCH_PARAM = RegExp(/\:([^/()]+)/g);

    function handleScroll (element) {
      if (navigator.userAgent.includes('jsdom')) return false
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash () {
      if (navigator.userAgent.includes('jsdom')) return false
      const { hash } = window.location;
      if (hash) {
        const validElementIdRegex = /^[A-Za-z]+[\w\-\:\.]*$/;
        if (validElementIdRegex.test(hash.substring(1))) {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView();
        }
      }
    }

    function scrollAncestorsToTop (element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock' &&
        element.dataset['routify-scroll'] !== 'lock'
      ) {
        element.style['scroll-behavior'] = 'auto';
        element.scrollTo({ top: 0, behavior: 'auto' });
        element.style['scroll-behavior'] = '';
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParamKeys = string => {
      const paramsKeys = [];
      let matches;
      while ((matches = MATCH_PARAM.exec(string))) paramsKeys.push(matches[1]);
      return paramsKeys
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings () {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function (msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    function currentLocation () {
      const pathMatch = window.location.search.match(/__routify_path=([^&]+)/);
      const prefetchMatch = window.location.search.match(/__routify_prefetch=\d+/);
      window.routify = window.routify || {};
      window.routify.prefetched = prefetchMatch ? true : false;
      const path = pathMatch && pathMatch[1].replace(/[#?].+/, ''); // strip any thing after ? and #
      return path || window.location.pathname
    }

    window.routify = window.routify || {};

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const route = writable(null); // the actual route being rendered

    /** @type {import('svelte/store').Writable<RouteNode[]>} */
    const routes = writable([]); // all routes
    routes.subscribe(routes => (window.routify.routes = routes));

    let rootContext = writable({ component: { params: {} } });

    /** @type {import('svelte/store').Writable<RouteNode>} */
    const urlRoute = writable(null);  // the route matching the url

    /** @type {import('svelte/store').Writable<String>} */
    const basepath = (() => {
        const { set, subscribe } = writable("");

        return {
            subscribe,
            set(value) {
                if (value.match(/^[/(]/))
                    set(value);
                else console.warn('Basepaths must start with / or (');
            },
            update() { console.warn('Use assignment or set to update basepaths.'); }
        }
    })();

    const location$1 = derived( // the part of the url matching the basepath
        [basepath, urlRoute],
        ([$basepath, $route]) => {
            const [, base, path] = currentLocation().match(`^(${$basepath})(${$route.regex})`) || [];
            return { base, path }
        }
    );

    const prefetchPath = writable("");

    function onAppLoaded({ path, metatags }) {
        metatags.update();
        const prefetchMatch = window.location.search.match(/__routify_prefetch=(\d+)/);
        const prefetchId = prefetchMatch && prefetchMatch[1];

        dispatchEvent(new CustomEvent('app-loaded'));
        parent.postMessage({
            msg: 'app-loaded',
            prefetched: window.routify.prefetched,
            path,
            prefetchId
        }, "*");
        window['routify'].appLoaded = true;
    }

    var defaultConfig = {
        queryHandler: {
            parse: search => fromEntries(new URLSearchParams(search)),
            stringify: params => '?' + (new URLSearchParams(params)).toString()
        }
    };


    function fromEntries(iterable) {
        return [...iterable].reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj
        }, {})
    }

    /**
     * @param {string} url 
     * @return {ClientNode}
     */
    function urlToRoute(url) {
        /** @type {RouteNode[]} */
        const routes$1 = get_store_value(routes);
        const basepath$1 = get_store_value(basepath);
        const route = routes$1.find(route => url.match(`^${basepath$1}${route.regex}`));
        if (!route)
            throw new Error(
                `Route could not be found for "${url}".`
            )

        const [, base] = url.match(`^(${basepath$1})${route.regex}`);
        const path = url.slice(base.length);

        if (defaultConfig.queryHandler)
            route.params = defaultConfig.queryHandler.parse(window.location.search);

        if (route.paramKeys) {
            const layouts = layoutByPos(route.layouts);
            const fragments = path.split('/').filter(Boolean);
            const routeProps = getRouteProps(route.path);

            routeProps.forEach((prop, i) => {
                if (prop) {
                    route.params[prop] = fragments[i];
                    if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
                    else route.param = { [prop]: fragments[i] };
                }
            });
        }

        route.leftover = url.replace(new RegExp(base + route.regex), '');

        return route
    }


    /**
     * @param {array} layouts
     */
    function layoutByPos(layouts) {
        const arr = [];
        layouts.forEach(layout => {
            arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
        });
        return arr
    }


    /**
     * @param {string} url
     */
    function getRouteProps(url) {
        return url
            .split('/')
            .filter(Boolean)
            .map(f => f.match(/\:(.+)/))
            .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Prefetcher.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file = "node_modules/@sveltech/routify/runtime/Prefetcher.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (93:2) {#each $actives as prefetch (prefetch.options.prefetch)}
    function create_each_block(key_1, ctx) {
    	let iframe;
    	let iframe_src_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			iframe = element("iframe");
    			if (iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "title", "routify prefetcher");
    			add_location(iframe, file, 93, 4, 2705);
    			this.first = iframe;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$actives*/ 1 && iframe.src !== (iframe_src_value = /*prefetch*/ ctx[1].url)) {
    				attr_dev(iframe, "src", iframe_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(93:2) {#each $actives as prefetch (prefetch.options.prefetch)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$actives*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*prefetch*/ ctx[1].options.prefetch;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "__routify_iframes");
    			set_style(div, "display", "none");
    			add_location(div, file, 91, 0, 2591);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$actives*/ 1) {
    				const each_value = /*$actives*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const iframeNum = 2;

    const defaults = {
    	validFor: 60,
    	timeout: 5000,
    	gracePeriod: 1000
    };

    /** stores and subscriptions */
    const queue = writable([]);

    const actives = derived(queue, q => q.slice(0, iframeNum));

    actives.subscribe(actives => actives.forEach(({ options }) => {
    	setTimeout(() => removeFromQueue(options.prefetch), options.timeout);
    }));

    function prefetch(path, options = {}) {
    	prefetch.id = prefetch.id || 1;

    	path = !path.href
    	? path
    	: path.href.replace(/^(?:\/\/|[^/]+)*\//, "/");

    	//replace first ? since were mixing user queries with routify queries
    	path = path.replace("?", "&");

    	options = { ...defaults, ...options, path };
    	options.prefetch = prefetch.id++;

    	//don't prefetch within prefetch or SSR
    	if (window.routify.prefetched || navigator.userAgent.match("jsdom")) return false;

    	// add to queue
    	queue.update(q => {
    		if (!q.some(e => e.options.path === path)) q.push({
    			url: `/__app.html?${optionsToQuery(options)}`,
    			options
    		});

    		return q;
    	});
    }

    /**
     * convert options to query string
     * {a:1,b:2} becomes __routify_a=1&routify_b=2
     * @param {defaults & {path: string, prefetch: number}} options
     */
    function optionsToQuery(options) {
    	return Object.entries(options).map(([key, val]) => `__routify_${key}=${val}`).join("&");
    }

    /**
     * @param {number|MessageEvent} idOrEvent
     */
    function removeFromQueue(idOrEvent) {
    	const id = idOrEvent.data ? idOrEvent.data.prefetchId : idOrEvent;
    	if (!id) return null;
    	const entry = get_store_value(queue).find(entry => entry && entry.options.prefetch == id);

    	// removeFromQueue is called by both eventListener and timeout,
    	// but we can only remove the item once
    	if (entry) {
    		const { gracePeriod } = entry.options;
    		const gracePromise = new Promise(resolve => setTimeout(resolve, gracePeriod));

    		const idlePromise = new Promise(resolve => {
    				window.requestIdleCallback
    				? window.requestIdleCallback(resolve)
    				: setTimeout(resolve, gracePeriod + 1000);
    			});

    		Promise.all([gracePromise, idlePromise]).then(() => {
    			queue.update(q => q.filter(q => q.options.prefetch != id));
    		});
    	}
    }

    // Listen to message from child window
    addEventListener("message", removeFromQueue, false);

    function instance($$self, $$props, $$invalidate) {
    	let $actives;
    	validate_store(actives, "actives");
    	component_subscribe($$self, actives, $$value => $$invalidate(0, $actives = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Prefetcher", slots, []);
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Prefetcher> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		writable,
    		derived,
    		get: get_store_value,
    		iframeNum,
    		defaults,
    		queue,
    		actives,
    		prefetch,
    		optionsToQuery,
    		removeFromQueue,
    		$actives
    	});

    	return [$actives];
    }

    class Prefetcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Prefetcher",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /// <reference path="../typedef.js" />

    /** @ts-check */
    /**
     * @typedef {Object} RoutifyContext
     * @prop {ClientNode} component
     * @prop {ClientNode} layout
     * @prop {any} componentFile 
     * 
     *  @returns {import('svelte/store').Readable<RoutifyContext>} */
    function getRoutifyContext() {
      return getContext('routify') || rootContext
    }

    /**
     * @callback AfterPageLoadHelper
     * @param {function} callback
     * 
     * @typedef {import('svelte/store').Readable<AfterPageLoadHelper> & {_hooks:Array<function>}} AfterPageLoadHelperStore
     * @type {AfterPageLoadHelperStore}
     */
    const afterPageLoad = {
      _hooks: [],
      subscribe: hookHandler
    };

    /** 
     * @callback BeforeUrlChangeHelper
     * @param {function} callback
     *
     * @typedef {import('svelte/store').Readable<BeforeUrlChangeHelper> & {_hooks:Array<function>}} BeforeUrlChangeHelperStore
     * @type {BeforeUrlChangeHelperStore}
     **/
    const beforeUrlChange = {
      _hooks: [],
      subscribe: hookHandler
    };

    function hookHandler(listener) {
      const hooks = this._hooks;
      const index = hooks.length;
      listener(callback => { hooks[index] = callback; });
      return () => delete hooks[index]
    }

    /**
     * @callback UrlHelper
     * @param {String=} path
     * @param {UrlParams=} params
     * @param {UrlOptions=} options
     * @return {String}
     *
     * @typedef {import('svelte/store').Readable<UrlHelper>} UrlHelperStore
     * @type {UrlHelperStore} 
     * */
    const url = {
      subscribe(listener) {
        const ctx = getRoutifyContext();
        return derived(
          [ctx, route, routes, location$1],
          args => makeUrlHelper(...args)
        ).subscribe(
          listener
        )
      }
    };

    /** 
     * @param {{component: ClientNode}} $ctx 
     * @param {RouteNode} $oldRoute 
     * @param {RouteNode[]} $routes 
     * @param {{base: string, path: string}} $location
     * @returns {UrlHelper}
     */
    function makeUrlHelper($ctx, $oldRoute, $routes, $location) {
      return function url(path, params, options) {
        const { component } = $ctx;
        path = path || './';

        const strict = options && options.strict !== false;
        if (!strict) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          let [, breadcrumbs, relativePath] = path.match(/^([\.\/]+)(.*)/);
          let dir = component.path.replace(/\/$/, '');
          const traverse = breadcrumbs.match(/\.\.\//g) || [];
          traverse.forEach(() => dir = dir.replace(/\/[^\/]+\/?$/, ''));
          path = `${dir}/${relativePath}`.replace(/\/$/, '');

        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = $routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        /** @type {Object<string, *>} Parameters */
        const allParams = Object.assign({}, $oldRoute.params, component.params, params);
        let pathWithParams = path;
        for (const [key, value] of Object.entries(allParams)) {
          pathWithParams = pathWithParams.replace(`:${key}`, value);
        }

        const fullPath = $location.base + pathWithParams + _getQueryString(path, params);
        return fullPath.replace(/\?$/, '')
      }
    }

    /**
     * 
     * @param {string} path 
     * @param {object} params 
     */
    function _getQueryString(path, params) {
      if (!defaultConfig.queryHandler) return ""
      const pathParamKeys = pathToParamKeys(path);
      const queryParams = {};
      if (params) Object.entries(params).forEach(([key, value]) => {
        if (!pathParamKeys.includes(key))
          queryParams[key] = value;
      });
      return defaultConfig.queryHandler.stringify(queryParams)
    }

    /**
    * @callback GotoHelper
    * @param {String=} path
    * @param {UrlParams=} params
    * @param {GotoOptions=} options
    *
    * @typedef {import('svelte/store').Readable<GotoHelper>}  GotoHelperStore
    * @type {GotoHelperStore} 
    * */
    const goto = {
      subscribe(listener) {
        return derived(url,
          url => function goto(path, params, _static, shallow) {
            const href = url(path, params);
            if (!_static) history.pushState({}, null, href);
            else getContext('routifyupdatepage')(href, shallow);
          }
        ).subscribe(
          listener
        )
      },
    };



    const _metatags = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _metatags.getLongest(_metatags.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _metatags.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _metatags.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = metatags.services[serviceName] || metatags.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _metatags.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _metatags.getOrigin();
        _metatags.templates[name] = _metatags.templates[name] || {};
        _metatags.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_metatags.props).forEach((prop) => {
          let value = (_metatags.getLongest(_metatags.props, prop));
          _metatags.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_metatags._pendingUpdate) {
          _metatags._pendingUpdate = true;
          setTimeout(() => {
            _metatags._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getRoutifyContext();
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };


    /**
     * metatags
     * @prop {Object.<string, string>}
     */
    const metatags = new Proxy(_metatags, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }

        if (window['routify'].appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    const isChangingPage = (function () {
      const store = writable(false);
      beforeUrlChange.subscribe(fn => fn(event => {
        store.set(true);
        return true
      }));
      
      afterPageLoad.subscribe(fn => fn(event => store.set(false)));

      return store
    })();

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.29.0 */
    const file$1 = "node_modules/@sveltech/routify/runtime/Route.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i].component;
    	child_ctx[20] = list[i].componentFile;
    	return child_ctx;
    }

    // (120:0) {#if $context}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$context*/ ctx[6].component.isLayout === false) return 0;
    		if (/*remainingLayouts*/ ctx[5].length) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(120:0) {#if $context}",
    		ctx
    	});

    	return block;
    }

    // (132:36) 
    function create_if_block_3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value_1 = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout, remainingLayouts, decorator, Decorator, scopeToChild*/ 100663415) {
    				const each_value_1 = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(132:36) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $context.component.isLayout === false}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [/*$context*/ ctx[6]];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*component*/ ctx[19].path;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$context, scoped, scopedSync, layout*/ 85) {
    				const each_value = [/*$context*/ ctx[6]];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(121:2) {#if $context.component.isLayout === false}",
    		ctx
    	});

    	return block;
    }

    // (134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>
    function create_default_slot(ctx) {
    	let route_1;
    	let t;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[5]],
    				Decorator: typeof /*decorator*/ ctx[26] !== "undefined"
    				? /*decorator*/ ctx[26]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*layout*/ ctx[4].isDecorator,
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[25]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 32) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[5]];

    			if (dirty & /*decorator, Decorator*/ 67108866) route_1_changes.Decorator = typeof /*decorator*/ ctx[26] !== "undefined"
    			? /*decorator*/ ctx[26]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*layout*/ 16) route_1_changes.childOfDecorator = /*layout*/ ctx[4].isDecorator;

    			if (dirty & /*scoped, scopeToChild*/ 33554433) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[25]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(134:6) <svelte:component         this={componentFile}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...layout.param || {}}>",
    		ctx
    	});

    	return block;
    }

    // (133:4) {#each [$context] as { component, componentFile }
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 25: scopeToChild, 26: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 33554432 : 0) | (decorator ? 67108864 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, layout, scoped, scopeToChild*/ 234881075) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(133:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (122:4) {#each [$context] as { component, componentFile }
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[2] },
    		/*layout*/ ctx[4].param || {}
    	];

    	var switch_value = /*componentFile*/ ctx[20];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, layout*/ 21)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 4 && { scopedSync: /*scopedSync*/ ctx[2] },
    					dirty & /*layout*/ 16 && get_spread_object(/*layout*/ ctx[4].param || {})
    				])
    			: {};

    			if (switch_value !== (switch_value = /*componentFile*/ ctx[20])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(122:4) {#each [$context] as { component, componentFile }",
    		ctx
    	});

    	return block;
    }

    // (152:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$1, 152, 2, 4450);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(setParent_action = /*setParent*/ ctx[8].call(null, span));
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(152:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$context*/ ctx[6] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$context*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$context*/ 64) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[3]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $route;
    	let $context;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(14, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, []);
    	let { layouts = [] } = $$props;
    	let { scoped = {} } = $$props;
    	let { Decorator = null } = $$props;
    	let { childOfDecorator = false } = $$props;
    	let { isRoot = false } = $$props;
    	let scopedSync = {};
    	let isDecorator = false;

    	/** @type {HTMLElement} */
    	let parentElement;

    	/** @type {LayoutOrDecorator} */
    	let layout = null;

    	/** @type {LayoutOrDecorator} */
    	let lastLayout = null;

    	/** @type {LayoutOrDecorator[]} */
    	let remainingLayouts = [];

    	const context = writable(null);
    	validate_store(context, "context");
    	component_subscribe($$self, context, value => $$invalidate(6, $context = value));

    	/** @type {import("svelte/store").Writable<Context>} */
    	const parentContextStore = getContext("routify");

    	isDecorator = Decorator && !childOfDecorator;
    	setContext("routify", context);

    	/** @param {HTMLElement} el */
    	function setParent(el) {
    		$$invalidate(3, parentElement = el.parentElement);
    	}

    	/** @param {SvelteComponent} componentFile */
    	function onComponentLoaded(componentFile) {
    		/** @type {Context} */
    		const parentContext = get_store_value(parentContextStore);

    		$$invalidate(2, scopedSync = { ...scoped });
    		lastLayout = layout;
    		if (remainingLayouts.length === 0) onLastComponentLoaded();

    		const ctx = {
    			layout: isDecorator ? parentContext.layout : layout,
    			component: layout,
    			route: $route,
    			componentFile,
    			child: isDecorator
    			? parentContext.child
    			: get_store_value(context) && get_store_value(context).child
    		};

    		context.set(ctx);
    		if (isRoot) rootContext.set(ctx);

    		if (parentContext && !isDecorator) parentContextStore.update(store => {
    			store.child = layout || store.child;
    			return store;
    		});
    	}

    	/**  @param {LayoutOrDecorator} layout */
    	function setComponent(layout) {
    		let PendingComponent = layout.component();
    		if (PendingComponent instanceof Promise) PendingComponent.then(onComponentLoaded); else onComponentLoaded(PendingComponent);
    	}

    	async function onLastComponentLoaded() {
    		afterPageLoad._hooks.forEach(hook => hook(layout.api));
    		await tick();
    		handleScroll(parentElement);

    		if (!window["routify"].appLoaded) {
    			const pagePath = $context.component.path;
    			const routePath = $route.path;
    			const isOnCurrentRoute = pagePath === routePath; //maybe we're getting redirected

    			// Let everyone know the last child has rendered
    			if (!window["routify"].stopAutoReady && isOnCurrentRoute) {
    				onAppLoaded({ path: pagePath, metatags });
    			}
    		}
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "childOfDecorator", "isRoot"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		get: get_store_value,
    		metatags,
    		afterPageLoad,
    		route,
    		routes,
    		rootContext,
    		handleScroll,
    		onAppLoaded,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		isRoot,
    		scopedSync,
    		isDecorator,
    		parentElement,
    		layout,
    		lastLayout,
    		remainingLayouts,
    		context,
    		parentContextStore,
    		setParent,
    		onComponentLoaded,
    		setComponent,
    		onLastComponentLoaded,
    		$route,
    		$context
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(9, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(10, childOfDecorator = $$props.childOfDecorator);
    		if ("isRoot" in $$props) $$invalidate(11, isRoot = $$props.isRoot);
    		if ("scopedSync" in $$props) $$invalidate(2, scopedSync = $$props.scopedSync);
    		if ("isDecorator" in $$props) $$invalidate(12, isDecorator = $$props.isDecorator);
    		if ("parentElement" in $$props) $$invalidate(3, parentElement = $$props.parentElement);
    		if ("layout" in $$props) $$invalidate(4, layout = $$props.layout);
    		if ("lastLayout" in $$props) lastLayout = $$props.lastLayout;
    		if ("remainingLayouts" in $$props) $$invalidate(5, remainingLayouts = $$props.remainingLayouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isDecorator, Decorator, layouts*/ 4610) {
    			 if (isDecorator) {
    				const decoratorLayout = {
    					component: () => Decorator,
    					path: `${layouts[0].path}__decorator`,
    					isDecorator: true
    				};

    				$$invalidate(9, layouts = [decoratorLayout, ...layouts]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 512) {
    			 $$invalidate(4, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(5, remainingLayouts), $$invalidate(9, layouts)), $$invalidate(12, isDecorator)), $$invalidate(1, Decorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 16) {
    			 setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		scopedSync,
    		parentElement,
    		layout,
    		remainingLayouts,
    		$context,
    		context,
    		setParent,
    		layouts,
    		childOfDecorator,
    		isRoot
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			layouts: 9,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 10,
    			isRoot: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRoot() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRoot(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function init$1(routes, callback) {
      /** @type { ClientNode | false } */
      let lastRoute = false;

      function updatePage(proxyToUrl, shallow) {
        const url = proxyToUrl || currentLocation();
        const route$1 = urlToRoute(url);
        const currentRoute = shallow && urlToRoute(currentLocation());
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        if (lastRoute) delete lastRoute.last; //todo is a page component the right place for the previous route?
        route$1.last = lastRoute;
        lastRoute = route$1;

        //set the route in the store
        if (!proxyToUrl)
          urlRoute.set(route$1);
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state = {}, title, url) {
          const { id, path, params } = get_store_value(route);
          state = { id, path, params, ...state };
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of beforeUrlChange._hooks.filter(Boolean)) {
        // return false if the hook returns false
        const result = await hook(event, route$1); //todo remove route from hook. Its API Can be accessed as $page
        if (!result) return false
      }
      return true
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$1 } = globals;

    // (64:0) {#if layouts && $route !== null}
    function create_if_block$1(ctx) {
    	let route_1;
    	let current;

    	route_1 = new Route({
    			props: {
    				layouts: /*layouts*/ ctx[0],
    				isRoot: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*layouts*/ 1) route_1_changes.layouts = /*layouts*/ ctx[0];
    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(64:0) {#if layouts && $route !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let prefetcher;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null && create_if_block$1(ctx);
    	prefetcher = new Prefetcher({ $$inline: true });

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(prefetcher.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(prefetcher, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0] && /*$route*/ ctx[1] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*layouts, $route*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(prefetcher.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(prefetcher.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(prefetcher, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(1, $route = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes: routes$1 } = $$props;
    	let { config = {} } = $$props;
    	let layouts;
    	let navigator;
    	window.routify = window.routify || {};
    	window.routify.inBrowser = !window.navigator.userAgent.match("jsdom");

    	Object.entries(config).forEach(([key, value]) => {
    		defaultConfig[key] = value;
    	});

    	suppressWarnings();
    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext("routifyupdatepage", updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	let initTimeout = null;

    	// init is async to prevent a horrible bug that completely disable reactivity
    	// in the host component -- something like the component's update function is
    	// called before its fragment is created, and since the component is then seen
    	// as already dirty, it is never scheduled for update again, and remains dirty
    	// forever... I failed to isolate the precise conditions for the bug, but the
    	// faulty update is triggered by a change in the route store, and so offseting
    	// store initialization by one tick gives the host component some time to
    	// create its fragment. The root cause it probably a bug in Svelte with deeply
    	// intertwinned store and reactivity.
    	const doInit = () => {
    		clearTimeout(initTimeout);

    		initTimeout = setTimeout(() => {
    			cleanup();
    			navigator = init$1(routes$1, callback);
    			routes.set(routes$1);
    			navigator.updatePage();
    		});
    	};

    	onDestroy(cleanup);
    	const writable_props = ["routes", "config"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		Prefetcher,
    		init: init$1,
    		route,
    		routesStore: routes,
    		prefetchPath,
    		suppressWarnings,
    		defaultConfig,
    		routes: routes$1,
    		config,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		initTimeout,
    		doInit,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(2, routes$1 = $$props.routes);
    		if ("config" in $$props) $$invalidate(3, config = $$props.config);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("navigator" in $$props) navigator = $$props.navigator;
    		if ("initTimeout" in $$props) initTimeout = $$props.initTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 4) {
    			 if (routes$1) doInit();
    		}
    	};

    	return [layouts, $route, routes$1, config];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { routes: 2, config: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[2] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /** 
     * Node payload
     * @typedef {Object} NodePayload
     * @property {RouteNode=} file current node
     * @property {RouteNode=} parent parent of the current node
     * @property {StateObject=} state state shared by every node in the walker
     * @property {Object=} scope scope inherited by descendants in the scope
     *
     * State Object
     * @typedef {Object} StateObject
     * @prop {TreePayload=} treePayload payload from the tree
     * 
     * Node walker proxy
     * @callback NodeWalkerProxy
     * @param {NodePayload} NodePayload
     */


    /**
     * Node middleware
     * @description Walks through the nodes of a tree
     * @example middleware = createNodeMiddleware(payload => {payload.file.name = 'hello'})(treePayload))
     * @param {NodeWalkerProxy} fn 
     */
    function createNodeMiddleware(fn) {

        /**    
         * NodeMiddleware payload receiver
         * @param {TreePayload} payload
         */
        const inner = async function execute(payload) {
            return await nodeMiddleware(payload.tree, fn, { state: { treePayload: payload } })
        };

        /**    
         * NodeMiddleware sync payload receiver
         * @param {TreePayload} payload
         */
        inner.sync = function executeSync(payload) {
            return nodeMiddlewareSync(payload.tree, fn, { state: { treePayload: payload } })
        };

        return inner
    }

    /**
     * Node walker
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    async function nodeMiddleware(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        await fn(payload);

        if (file.children) {
            payload.parent = file;
            await Promise.all(file.children.map(_file => nodeMiddleware(_file, fn, payload)));
        }
        return payload
    }

    /**
     * Node walker (sync version)
     * @param {Object} file mutable file
     * @param {NodeWalkerProxy} fn function to be called for each file
     * @param {NodePayload=} payload 
     */
    function nodeMiddlewareSync(file, fn, payload) {
        const { state, scope, parent } = payload || {};
        payload = {
            file,
            parent,
            state: state || {},            //state is shared by all files in the walk
            scope: clone(scope || {}),     //scope is inherited by descendants
        };

        fn(payload);

        if (file.children) {
            payload.parent = file;
            file.children.map(_file => nodeMiddlewareSync(_file, fn, payload));
        }
        return payload
    }


    /**
     * Clone with JSON
     * @param {T} obj 
     * @returns {T} JSON cloned object
     * @template T
     */
    function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

    const setRegex = createNodeMiddleware(({ file }) => {
        if (file.isPage || file.isFallback)
            file.regex = pathToRegex(file.path, file.isFallback);
    });
    const setParamKeys = createNodeMiddleware(({ file }) => {
        file.paramKeys = pathToParamKeys(file.path);
    });

    const setShortPath = createNodeMiddleware(({ file }) => {
        if (file.isFallback || file.isIndex)
            file.shortPath = file.path.replace(/\/[^/]+$/, '');
        else file.shortPath = file.path;
    });
    const setRank = createNodeMiddleware(({ file }) => {
        file.ranking = pathToRank(file);
    });


    // todo delete?
    const addMetaChildren = createNodeMiddleware(({ file }) => {
        const node = file;
        const metaChildren = file.meta && file.meta.children || [];
        if (metaChildren.length) {
            node.children = node.children || [];
            node.children.push(...metaChildren.map(meta => ({ isMeta: true, ...meta, meta })));
        }
    });

    const setIsIndexable = createNodeMiddleware(payload => {
        const { file } = payload;
        const { isLayout, isFallback, meta } = file;
        file.isIndexable = !isLayout && !isFallback && meta.index !== false;
        file.isNonIndexable = !file.isIndexable;
    });


    const assignRelations = createNodeMiddleware(({ file, parent }) => {
        Object.defineProperty(file, 'parent', { get: () => parent });
        Object.defineProperty(file, 'nextSibling', { get: () => _getSibling(file, 1) });
        Object.defineProperty(file, 'prevSibling', { get: () => _getSibling(file, -1) });
        Object.defineProperty(file, 'lineage', { get: () => _getLineage(parent) });
    });

    function _getLineage(node, lineage = []){
        if(node){
            lineage.unshift(node);
            _getLineage(node.parent, lineage);
        }
        return lineage
    }

    /**
     * 
     * @param {RouteNode} file 
     * @param {Number} direction 
     */
    function _getSibling(file, direction) {
        if (!file.root) {
            const siblings = file.parent.children.filter(c => c.isIndexable);
            const index = siblings.indexOf(file);
            return siblings[index + direction]
        }
    }

    const assignIndex = createNodeMiddleware(({ file, parent }) => {
        if (file.isIndex) Object.defineProperty(parent, 'index', { get: () => file });
        if (file.isLayout)
            Object.defineProperty(parent, 'layout', { get: () => file });
    });

    const assignLayout = createNodeMiddleware(({ file, scope }) => {
        Object.defineProperty(file, 'layouts', { get: () => getLayouts(file) });
        function getLayouts(file) {
            const { parent } = file;
            const layout = parent && parent.layout;
            const isReset = layout && layout.isReset;
            const layouts = (parent && !isReset && getLayouts(parent)) || [];
            if (layout) layouts.push(layout);
            return layouts
        }
    });


    const createFlatList = treePayload => {
        createNodeMiddleware(payload => {
            if (payload.file.isPage || payload.file.isFallback)
            payload.state.treePayload.routes.push(payload.file);
        }).sync(treePayload);    
        treePayload.routes.sort((c, p) => (c.ranking >= p.ranking ? -1 : 1));
    };

    const setPrototype = createNodeMiddleware(({ file }) => {
        const Prototype = file.root
            ? Root
            : file.children
                ? file.isFile ? PageDir : Dir
                : file.isReset
                    ? Reset
                    : file.isLayout
                        ? Layout
                        : file.isFallback
                            ? Fallback
                            : Page;
        Object.setPrototypeOf(file, Prototype.prototype);

        function Layout() { }
        function Dir() { }
        function Fallback() { }
        function Page() { }
        function PageDir() { }
        function Reset() { }
        function Root() { }
    });

    var miscPlugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setRegex: setRegex,
        setParamKeys: setParamKeys,
        setShortPath: setShortPath,
        setRank: setRank,
        addMetaChildren: addMetaChildren,
        setIsIndexable: setIsIndexable,
        assignRelations: assignRelations,
        assignIndex: assignIndex,
        assignLayout: assignLayout,
        createFlatList: createFlatList,
        setPrototype: setPrototype
    });

    const assignAPI = createNodeMiddleware(({ file }) => {
        file.api = new ClientApi(file);
    });

    class ClientApi {
        constructor(file) {
            this.__file = file;
            Object.defineProperty(this, '__file', { enumerable: false });
            this.isMeta = !!file.isMeta;
            this.path = file.path;
            this.title = _prettyName(file);
            this.meta = file.meta;
        }

        get parent() { return !this.__file.root && this.__file.parent.api }
        get children() {
            return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
                .filter(c => !c.isNonIndexable)
                .sort((a, b) => {
                    if(a.isMeta && b.isMeta) return 0
                    a = (a.meta.index || a.meta.title || a.path).toString();
                    b = (b.meta.index || b.meta.title || b.path).toString();
                    return a.localeCompare((b), undefined, { numeric: true, sensitivity: 'base' })
                })
                .map(({ api }) => api)
        }
        get next() { return _navigate(this, +1) }
        get prev() { return _navigate(this, -1) }
        preload() {
            this.__file.layouts.forEach(file => file.component());
            this.__file.component(); 
        }
    }

    function _navigate(node, direction) {
        if (!node.__file.root) {
            const siblings = node.parent.children;
            const index = siblings.indexOf(node);
            return node.parent.children[index + direction]
        }
    }


    function _prettyName(file) {
        if (typeof file.meta.title !== 'undefined') return file.meta.title
        else return (file.shortPath || file.path)
            .split('/')
            .pop()
            .replace(/-/g, ' ')
    }

    const plugins = {...miscPlugins, assignAPI};

    function buildClientTree(tree) {
      const order = [
        // pages
        "setParamKeys", //pages only
        "setRegex", //pages only
        "setShortPath", //pages only
        "setRank", //pages only
        "assignLayout", //pages only,
        // all
        "setPrototype",
        "addMetaChildren",
        "assignRelations", //all (except meta components?)
        "setIsIndexable", //all
        "assignIndex", //all
        "assignAPI", //all
        // routes
        "createFlatList"
      ];

      const payload = { tree, routes: [] };
      for (let name of order) {
        const syncFn = plugins[name].sync || plugins[name];
        syncFn(payload);
      }
      return payload
    }

    /* src/pages/_fallback.svelte generated by Svelte v3.29.0 */
    const file$2 = "src/pages/_fallback.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "404";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Page not found. \n  \n  ");
    			a = element("a");
    			t3 = text("Go back");
    			attr_dev(div0, "class", "huge svelte-viq1pm");
    			add_location(div0, file$2, 18, 2, 268);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../"));
    			add_location(a, file$2, 21, 2, 391);
    			attr_dev(div1, "class", "big");
    			add_location(div1, file$2, 19, 2, 298);
    			attr_dev(div2, "class", "e404 svelte-viq1pm");
    			add_location(div2, file$2, 17, 0, 247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const count = writable(0);
    const players = writable(
    [
        {
            id: 1,
            name: 'Pinball Wizard',
            picture: 'https://i.imgur.com/O4QdclB.jpg',
            points: 101,
            bio: 'Bio: The best around'
        },
        {
            id: 2,
            name: 'Current Player',
            picture: 'https://i.imgur.com/kjxayZk.png',
            points: 0,
            bio: ''
        }
    ]);

    /* src/components/player.svelte generated by Svelte v3.29.0 */

    const file$3 = "src/components/player.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let h3;
    	let t5;
    	let t6;
    	let t7;
    	let h4;
    	let t8;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(/*id*/ ctx[3]);
    			t1 = text(": ");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			h3 = element("h3");
    			t5 = text("points: ");
    			t6 = text(/*points*/ ctx[1]);
    			t7 = space();
    			h4 = element("h4");
    			t8 = text(/*bio*/ ctx[4]);
    			attr_dev(h2, "class", "svelte-1htcwsj");
    			add_location(h2, file$3, 11, 2, 149);
    			if (img.src !== (img_src_value = /*picture*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "bio pic");
    			attr_dev(img, "class", "svelte-1htcwsj");
    			add_location(img, file$3, 14, 2, 180);
    			attr_dev(h3, "class", "svelte-1htcwsj");
    			add_location(h3, file$3, 15, 2, 217);
    			attr_dev(h4, "class", "svelte-1htcwsj");
    			add_location(h4, file$3, 16, 2, 245);
    			attr_dev(div, "class", "player svelte-1htcwsj");
    			add_location(div, file$3, 10, 1, 126);
    			attr_dev(main, "class", "svelte-1htcwsj");
    			add_location(main, file$3, 9, 0, 118);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(div, t3);
    			append_dev(div, img);
    			append_dev(div, t4);
    			append_dev(div, h3);
    			append_dev(h3, t5);
    			append_dev(h3, t6);
    			append_dev(div, t7);
    			append_dev(div, h4);
    			append_dev(h4, t8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 8) set_data_dev(t0, /*id*/ ctx[3]);
    			if (dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);

    			if (dirty & /*picture*/ 4 && img.src !== (img_src_value = /*picture*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*points*/ 2) set_data_dev(t6, /*points*/ ctx[1]);
    			if (dirty & /*bio*/ 16) set_data_dev(t8, /*bio*/ ctx[4]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player", slots, []);
    	let { name = "" } = $$props;
    	let { points } = $$props;
    	let { picture } = $$props;
    	let { id } = $$props;
    	let { bio } = $$props;
    	const writable_props = ["name", "points", "picture", "id", "bio"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("points" in $$props) $$invalidate(1, points = $$props.points);
    		if ("picture" in $$props) $$invalidate(2, picture = $$props.picture);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("bio" in $$props) $$invalidate(4, bio = $$props.bio);
    	};

    	$$self.$capture_state = () => ({ name, points, picture, id, bio });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("points" in $$props) $$invalidate(1, points = $$props.points);
    		if ("picture" in $$props) $$invalidate(2, picture = $$props.picture);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("bio" in $$props) $$invalidate(4, bio = $$props.bio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, points, picture, id, bio];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			name: 0,
    			points: 1,
    			picture: 2,
    			id: 3,
    			bio: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*points*/ ctx[1] === undefined && !("points" in props)) {
    			console.warn("<Player> was created without expected prop 'points'");
    		}

    		if (/*picture*/ ctx[2] === undefined && !("picture" in props)) {
    			console.warn("<Player> was created without expected prop 'picture'");
    		}

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
    			console.warn("<Player> was created without expected prop 'id'");
    		}

    		if (/*bio*/ ctx[4] === undefined && !("bio" in props)) {
    			console.warn("<Player> was created without expected prop 'bio'");
    		}
    	}

    	get name() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get points() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set points(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get picture() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set picture(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bio() {
    		throw new Error("<Player>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bio(value) {
    		throw new Error("<Player>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus', 'blur',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        ...additionalEvents
      ];

      function forward(e) {
        bubble(component, e);
      }

      return node => {
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          }
        }
      };
    }

    function exclude(obj, keys) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const cashIndex = name.indexOf('$');
        if (cashIndex !== -1 && keys.indexOf(name.substring(0, cashIndex + 1)) !== -1) {
          continue;
        }
        if (keys.indexOf(name) !== -1) {
          continue;
        }
        newObj[name] = obj[name];
      }

      return newObj;
    }

    function useActions(node, actions) {
      let objects = [];

      if (actions) {
        for (let i = 0; i < actions.length; i++) {
          const isArray = Array.isArray(actions[i]);
          const action = isArray ? actions[i][0] : actions[i];
          if (isArray && actions[i].length > 1) {
            objects.push(action(node, actions[i][1]));
          } else {
            objects.push(action(node));
          }
        }
      }

      return {
        update(actions) {
          if ((actions && actions.length || 0) != objects.length) {
            throw new Error('You must not change the length of an actions array.');
          }

          if (actions) {
            for (let i = 0; i < actions.length; i++) {
              if (objects[i] && 'update' in objects[i]) {
                const isArray = Array.isArray(actions[i]);
                if (isArray && actions[i].length > 1) {
                  objects[i].update(actions[i][1]);
                } else {
                  objects[i].update();
                }
              }
            }
          }
        },

        destroy() {
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] && 'destroy' in objects[i]) {
              objects[i].destroy();
            }
          }
        }
      }
    }

    /* node_modules/@smui/paper/Paper.svelte generated by Svelte v3.29.0 */
    const file$4 = "node_modules/@smui/paper/Paper.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	let div_levels = [
    		{
    			class: div_class_value = "\n    smui-paper\n    " + /*className*/ ctx[1] + "\n    " + (/*elevation*/ ctx[4] !== 0
    			? "mdc-elevation--z" + /*elevation*/ ctx[4]
    			: "") + "\n    " + (!/*square*/ ctx[2] ? "smui-paper--rounded" : "") + "\n    " + (/*color*/ ctx[3] === "primary"
    			? "smui-paper--color-primary"
    			: "") + "\n    " + (/*color*/ ctx[3] === "secondary"
    			? "smui-paper--color-secondary"
    			: "") + "\n    " + (/*transition*/ ctx[5] ? "mdc-elevation-transition" : "") + "\n  "
    		},
    		exclude(/*$$props*/ ctx[7], ["use", "class", "square", "color", "transition"])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[6].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, elevation, square, color, transition*/ 62 && div_class_value !== (div_class_value = "\n    smui-paper\n    " + /*className*/ ctx[1] + "\n    " + (/*elevation*/ ctx[4] !== 0
    				? "mdc-elevation--z" + /*elevation*/ ctx[4]
    				: "") + "\n    " + (!/*square*/ ctx[2] ? "smui-paper--rounded" : "") + "\n    " + (/*color*/ ctx[3] === "primary"
    				? "smui-paper--color-primary"
    				: "") + "\n    " + (/*color*/ ctx[3] === "secondary"
    				? "smui-paper--color-secondary"
    				: "") + "\n    " + (/*transition*/ ctx[5] ? "mdc-elevation-transition" : "") + "\n  ")) && { class: div_class_value },
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], ["use", "class", "square", "color", "transition"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Paper", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { square = false } = $$props;
    	let { color = "default" } = $$props;
    	let { elevation = 1 } = $$props;
    	let { transition = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("square" in $$new_props) $$invalidate(2, square = $$new_props.square);
    		if ("color" in $$new_props) $$invalidate(3, color = $$new_props.color);
    		if ("elevation" in $$new_props) $$invalidate(4, elevation = $$new_props.elevation);
    		if ("transition" in $$new_props) $$invalidate(5, transition = $$new_props.transition);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		afterUpdate,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		square,
    		color,
    		elevation,
    		transition
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("square" in $$props) $$invalidate(2, square = $$new_props.square);
    		if ("color" in $$props) $$invalidate(3, color = $$new_props.color);
    		if ("elevation" in $$props) $$invalidate(4, elevation = $$new_props.elevation);
    		if ("transition" in $$props) $$invalidate(5, transition = $$new_props.transition);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		square,
    		color,
    		elevation,
    		transition,
    		forwardEvents,
    		$$props,
    		$$scope,
    		slots
    	];
    }

    class Paper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			use: 0,
    			class: 1,
    			square: 2,
    			color: 3,
    			elevation: 4,
    			transition: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Paper",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get use() {
    		throw new Error("<Paper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Paper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Paper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Paper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get square() {
    		throw new Error("<Paper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set square(value) {
    		throw new Error("<Paper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Paper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Paper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elevation() {
    		throw new Error("<Paper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elevation(value) {
    		throw new Error("<Paper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transition() {
    		throw new Error("<Paper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transition(value) {
    		throw new Error("<Paper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/ClassAdder.svelte generated by Svelte v3.29.0 */

    // (1:0) <svelte:component   this={component}   use={[forwardEvents, ...use]}   class="{smuiClass} {className}"   {...exclude($$props, ['use', 'class', 'component', 'forwardEvents'])} >
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   use={[forwardEvents, ...use]}   class=\\\"{smuiClass} {className}\\\"   {...exclude($$props, ['use', 'class', 'component', 'forwardEvents'])} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    		},
    		{
    			class: "" + (/*smuiClass*/ ctx[3] + " " + /*className*/ ctx[1])
    		},
    		exclude(/*$$props*/ ctx[5], ["use", "class", "component", "forwardEvents"])
    	];

    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$1] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*forwardEvents, use, smuiClass, className, exclude, $$props*/ 59)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*forwardEvents, use*/ 17 && {
    						use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    					},
    					dirty & /*smuiClass, className*/ 10 && {
    						class: "" + (/*smuiClass*/ ctx[3] + " " + /*className*/ ctx[1])
    					},
    					dirty & /*exclude, $$props*/ 32 && get_spread_object(exclude(/*$$props*/ ctx[5], ["use", "class", "component", "forwardEvents"]))
    				])
    			: {};

    			if (dirty & /*$$scope*/ 256) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const internals = {
    	component: null,
    	smuiClass: null,
    	contexts: {}
    };

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClassAdder", slots, ['default']);
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { component = internals.component } = $$props;
    	let { forwardEvents: smuiForwardEvents = [] } = $$props;
    	const smuiClass = internals.class;
    	const contexts = internals.contexts;
    	const forwardEvents = forwardEventsBuilder(get_current_component(), smuiForwardEvents);

    	for (let context in contexts) {
    		if (contexts.hasOwnProperty(context)) {
    			setContext(context, contexts[context]);
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("component" in $$new_props) $$invalidate(2, component = $$new_props.component);
    		if ("forwardEvents" in $$new_props) $$invalidate(6, smuiForwardEvents = $$new_props.forwardEvents);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		internals,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		use,
    		className,
    		component,
    		smuiForwardEvents,
    		smuiClass,
    		contexts,
    		forwardEvents
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("component" in $$props) $$invalidate(2, component = $$new_props.component);
    		if ("smuiForwardEvents" in $$props) $$invalidate(6, smuiForwardEvents = $$new_props.smuiForwardEvents);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		component,
    		smuiClass,
    		forwardEvents,
    		$$props,
    		smuiForwardEvents,
    		slots,
    		$$scope
    	];
    }

    class ClassAdder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			use: 0,
    			class: 1,
    			component: 2,
    			forwardEvents: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClassAdder",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get use() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get forwardEvents() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set forwardEvents(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function classAdderBuilder(props) {
      function Component(...args) {
        Object.assign(internals, props);
        return new ClassAdder(...args);
      }

      Component.prototype = ClassAdder;

      // SSR support
      if (ClassAdder.$$render) {
        Component.$$render = (...args) => Object.assign(internals, props) && ClassAdder.$$render(...args);
      }
      if (ClassAdder.render) {
        Component.render = (...args) => Object.assign(internals, props) && ClassAdder.render(...args);
      }

      return Component;
    }

    /* node_modules/@smui/common/Div.svelte generated by Svelte v3.29.0 */
    const file$5 = "node_modules/@smui/common/Div.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let div_levels = [exclude(/*$$props*/ ctx[2], ["use"])];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use"])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Div", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class Div extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { use: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Div",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get use() {
    		throw new Error("<Div>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Div>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Content = classAdderBuilder({
      class: 'smui-paper__content',
      component: Div,
      contexts: {}
    });

    /* node_modules/@smui/common/H5.svelte generated by Svelte v3.29.0 */
    const file$6 = "node_modules/@smui/common/H5.svelte";

    function create_fragment$8(ctx) {
    	let h5;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h5_levels = [exclude(/*$$props*/ ctx[2], ["use"])];
    	let h5_data = {};

    	for (let i = 0; i < h5_levels.length; i += 1) {
    		h5_data = assign(h5_data, h5_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			if (default_slot) default_slot.c();
    			set_attributes(h5, h5_data);
    			add_location(h5, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);

    			if (default_slot) {
    				default_slot.m(h5, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h5, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, h5))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(h5, h5_data = get_spread_update(h5_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use"])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("H5", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class H5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { use: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "H5",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get use() {
    		throw new Error("<H5>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<H5>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Title = classAdderBuilder({
      class: 'smui-paper__title',
      component: H5,
      contexts: {}
    });

    /* node_modules/@smui/common/H6.svelte generated by Svelte v3.29.0 */
    const file$7 = "node_modules/@smui/common/H6.svelte";

    function create_fragment$9(ctx) {
    	let h6;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h6_levels = [exclude(/*$$props*/ ctx[2], ["use"])];
    	let h6_data = {};

    	for (let i = 0; i < h6_levels.length; i += 1) {
    		h6_data = assign(h6_data, h6_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h6 = element("h6");
    			if (default_slot) default_slot.c();
    			set_attributes(h6, h6_data);
    			add_location(h6, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h6, anchor);

    			if (default_slot) {
    				default_slot.m(h6, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h6, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, h6))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(h6, h6_data = get_spread_update(h6_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use"])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h6);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("H6", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class H6 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { use: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "H6",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get use() {
    		throw new Error("<H6>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<H6>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Subtitle = classAdderBuilder({
      class: 'smui-paper__subtitle',
      component: H6,
      contexts: {}
    });

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses = {
        ANCHOR: 'mdc-menu-surface--anchor',
        ANIMATING_CLOSED: 'mdc-menu-surface--animating-closed',
        ANIMATING_OPEN: 'mdc-menu-surface--animating-open',
        FIXED: 'mdc-menu-surface--fixed',
        OPEN: 'mdc-menu-surface--open',
        ROOT: 'mdc-menu-surface',
    };
    // tslint:disable:object-literal-sort-keys
    var strings = {
        CLOSED_EVENT: 'MDCMenuSurface:closed',
        OPENED_EVENT: 'MDCMenuSurface:opened',
        FOCUSABLE_ELEMENTS: [
            'button:not(:disabled)', '[href]:not([aria-disabled="true"])', 'input:not(:disabled)',
            'select:not(:disabled)', 'textarea:not(:disabled)', '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
        ].join(', '),
    };
    // tslint:enable:object-literal-sort-keys
    var numbers = {
        /** Total duration of menu-surface open animation. */
        TRANSITION_OPEN_DURATION: 120,
        /** Total duration of menu-surface close animation. */
        TRANSITION_CLOSE_DURATION: 75,
        /** Margin left to the edge of the viewport when menu-surface is at maximum possible height. */
        MARGIN_TO_EDGE: 32,
        /** Ratio of anchor width to menu-surface width for switching from corner positioning to center positioning. */
        ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO: 0.67,
    };
    /**
     * Enum for bits in the {@see Corner) bitmap.
     */
    var CornerBit;
    (function (CornerBit) {
        CornerBit[CornerBit["BOTTOM"] = 1] = "BOTTOM";
        CornerBit[CornerBit["CENTER"] = 2] = "CENTER";
        CornerBit[CornerBit["RIGHT"] = 4] = "RIGHT";
        CornerBit[CornerBit["FLIP_RTL"] = 8] = "FLIP_RTL";
    })(CornerBit || (CornerBit = {}));
    /**
     * Enum for representing an element corner for positioning the menu-surface.
     *
     * The START constants map to LEFT if element directionality is left
     * to right and RIGHT if the directionality is right to left.
     * Likewise END maps to RIGHT or LEFT depending on the directionality.
     */
    var Corner;
    (function (Corner) {
        Corner[Corner["TOP_LEFT"] = 0] = "TOP_LEFT";
        Corner[Corner["TOP_RIGHT"] = 4] = "TOP_RIGHT";
        Corner[Corner["BOTTOM_LEFT"] = 1] = "BOTTOM_LEFT";
        Corner[Corner["BOTTOM_RIGHT"] = 5] = "BOTTOM_RIGHT";
        Corner[Corner["TOP_START"] = 8] = "TOP_START";
        Corner[Corner["TOP_END"] = 12] = "TOP_END";
        Corner[Corner["BOTTOM_START"] = 9] = "BOTTOM_START";
        Corner[Corner["BOTTOM_END"] = 13] = "BOTTOM_END";
    })(Corner || (Corner = {}));

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter_ = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: true,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCComponent = /** @class */ (function () {
        function MDCComponent(root, foundation) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            this.root_ = root;
            this.initialize.apply(this, __spread(args));
            // Note that we initialize foundation here and not within the constructor's default param so that
            // this.root_ is defined and can be used within the foundation class.
            this.foundation_ = foundation === undefined ? this.getDefaultFoundation() : foundation;
            this.foundation_.init();
            this.initialSyncWithDOM();
        }
        MDCComponent.attachTo = function (root) {
            // Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and
            // returns an instantiated component with its root set to that element. Also note that in the cases of
            // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized
            // from getDefaultFoundation().
            return new MDCComponent(root, new MDCFoundation({}));
        };
        /* istanbul ignore next: method param only exists for typing purposes; it does not need to be unit tested */
        MDCComponent.prototype.initialize = function () {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            // Subclasses can override this to do any additional setup work that would be considered part of a
            // "constructor". Essentially, it is a hook into the parent constructor before the foundation is
            // initialized. Any additional arguments besides root and foundation will be passed in here.
        };
        MDCComponent.prototype.getDefaultFoundation = function () {
            // Subclasses must override this method to return a properly configured foundation class for the
            // component.
            throw new Error('Subclasses must override getDefaultFoundation to return a properly configured ' +
                'foundation class');
        };
        MDCComponent.prototype.initialSyncWithDOM = function () {
            // Subclasses should override this method if they need to perform work to synchronize with a host DOM
            // object. An example of this would be a form control wrapper that needs to synchronize its internal state
            // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM
            // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.
        };
        MDCComponent.prototype.destroy = function () {
            // Subclasses may implement this method to release any resources / deregister any listeners they have
            // attached. An example of this might be deregistering a resize event from the window object.
            this.foundation_.destroy();
        };
        MDCComponent.prototype.listen = function (evtType, handler, options) {
            this.root_.addEventListener(evtType, handler, options);
        };
        MDCComponent.prototype.unlisten = function (evtType, handler, options) {
            this.root_.removeEventListener(evtType, handler, options);
        };
        /**
         * Fires a cross-browser-compatible custom event from the component root of the given type, with the given data.
         */
        MDCComponent.prototype.emit = function (evtType, evtData, shouldBubble) {
            if (shouldBubble === void 0) { shouldBubble = false; }
            var evt;
            if (typeof CustomEvent === 'function') {
                evt = new CustomEvent(evtType, {
                    bubbles: shouldBubble,
                    detail: evtData,
                });
            }
            else {
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(evtType, shouldBubble, false, evtData);
            }
            this.root_.dispatchEvent(evt);
        };
        return MDCComponent;
    }());

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * @fileoverview A "ponyfill" is a polyfill that doesn't modify the global prototype chain.
     * This makes ponyfills safer than traditional polyfills, especially for libraries like MDC.
     */
    function closest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        var el = element;
        while (el) {
            if (matches(el, selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }
    function matches(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$1 = {
        LIST_ITEM_ACTIVATED_CLASS: 'mdc-list-item--activated',
        LIST_ITEM_CLASS: 'mdc-list-item',
        LIST_ITEM_DISABLED_CLASS: 'mdc-list-item--disabled',
        LIST_ITEM_SELECTED_CLASS: 'mdc-list-item--selected',
        ROOT: 'mdc-list',
    };
    var strings$1 = {
        ACTION_EVENT: 'MDCList:action',
        ARIA_CHECKED: 'aria-checked',
        ARIA_CHECKED_CHECKBOX_SELECTOR: '[role="checkbox"][aria-checked="true"]',
        ARIA_CHECKED_RADIO_SELECTOR: '[role="radio"][aria-checked="true"]',
        ARIA_CURRENT: 'aria-current',
        ARIA_DISABLED: 'aria-disabled',
        ARIA_ORIENTATION: 'aria-orientation',
        ARIA_ORIENTATION_HORIZONTAL: 'horizontal',
        ARIA_ROLE_CHECKBOX_SELECTOR: '[role="checkbox"]',
        ARIA_SELECTED: 'aria-selected',
        CHECKBOX_RADIO_SELECTOR: 'input[type="checkbox"]:not(:disabled), input[type="radio"]:not(:disabled)',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]:not(:disabled)',
        CHILD_ELEMENTS_TO_TOGGLE_TABINDEX: "\n    ." + cssClasses$1.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$1.LIST_ITEM_CLASS + " a\n  ",
        FOCUSABLE_CHILD_ELEMENTS: "\n    ." + cssClasses$1.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$1.LIST_ITEM_CLASS + " a,\n    ." + cssClasses$1.LIST_ITEM_CLASS + " input[type=\"radio\"]:not(:disabled),\n    ." + cssClasses$1.LIST_ITEM_CLASS + " input[type=\"checkbox\"]:not(:disabled)\n  ",
        RADIO_SELECTOR: 'input[type="radio"]:not(:disabled)',
    };
    var numbers$1 = {
        UNSET_INDEX: -1,
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ELEMENTS_KEY_ALLOWED_IN = ['input', 'button', 'textarea', 'select'];
    function isNumberArray(selectedIndex) {
        return selectedIndex instanceof Array;
    }
    var MDCListFoundation = /** @class */ (function (_super) {
        __extends(MDCListFoundation, _super);
        function MDCListFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCListFoundation.defaultAdapter, adapter)) || this;
            _this.wrapFocus_ = false;
            _this.isVertical_ = true;
            _this.isSingleSelectionList_ = false;
            _this.selectedIndex_ = numbers$1.UNSET_INDEX;
            _this.focusedItemIndex_ = numbers$1.UNSET_INDEX;
            _this.useActivatedClass_ = false;
            _this.ariaCurrentAttrValue_ = null;
            _this.isCheckboxList_ = false;
            _this.isRadioList_ = false;
            return _this;
        }
        Object.defineProperty(MDCListFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "cssClasses", {
            get: function () {
                return cssClasses$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClassForElementIndex: function () { return undefined; },
                    focusItemAtIndex: function () { return undefined; },
                    getAttributeForElementIndex: function () { return null; },
                    getFocusedElementIndex: function () { return 0; },
                    getListItemCount: function () { return 0; },
                    hasCheckboxAtIndex: function () { return false; },
                    hasRadioAtIndex: function () { return false; },
                    isCheckboxCheckedAtIndex: function () { return false; },
                    isFocusInsideList: function () { return false; },
                    isRootFocused: function () { return false; },
                    notifyAction: function () { return undefined; },
                    removeClassForElementIndex: function () { return undefined; },
                    setAttributeForElementIndex: function () { return undefined; },
                    setCheckedCheckboxOrRadioAtIndex: function () { return undefined; },
                    setTabIndexForListItemChildren: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCListFoundation.prototype.layout = function () {
            if (this.adapter_.getListItemCount() === 0) {
                return;
            }
            if (this.adapter_.hasCheckboxAtIndex(0)) {
                this.isCheckboxList_ = true;
            }
            else if (this.adapter_.hasRadioAtIndex(0)) {
                this.isRadioList_ = true;
            }
        };
        /**
         * Sets the private wrapFocus_ variable.
         */
        MDCListFoundation.prototype.setWrapFocus = function (value) {
            this.wrapFocus_ = value;
        };
        /**
         * Sets the isVertical_ private variable.
         */
        MDCListFoundation.prototype.setVerticalOrientation = function (value) {
            this.isVertical_ = value;
        };
        /**
         * Sets the isSingleSelectionList_ private variable.
         */
        MDCListFoundation.prototype.setSingleSelection = function (value) {
            this.isSingleSelectionList_ = value;
        };
        /**
         * Sets the useActivatedClass_ private variable.
         */
        MDCListFoundation.prototype.setUseActivatedClass = function (useActivated) {
            this.useActivatedClass_ = useActivated;
        };
        MDCListFoundation.prototype.getSelectedIndex = function () {
            return this.selectedIndex_;
        };
        MDCListFoundation.prototype.setSelectedIndex = function (index) {
            if (!this.isIndexValid_(index)) {
                return;
            }
            if (this.isCheckboxList_) {
                this.setCheckboxAtIndex_(index);
            }
            else if (this.isRadioList_) {
                this.setRadioAtIndex_(index);
            }
            else {
                this.setSingleSelectionAtIndex_(index);
            }
        };
        /**
         * Focus in handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusIn = function (_, listItemIndex) {
            if (listItemIndex >= 0) {
                this.adapter_.setTabIndexForListItemChildren(listItemIndex, '0');
            }
        };
        /**
         * Focus out handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusOut = function (_, listItemIndex) {
            var _this = this;
            if (listItemIndex >= 0) {
                this.adapter_.setTabIndexForListItemChildren(listItemIndex, '-1');
            }
            /**
             * Between Focusout & Focusin some browsers do not have focus on any element. Setting a delay to wait till the focus
             * is moved to next element.
             */
            setTimeout(function () {
                if (!_this.adapter_.isFocusInsideList()) {
                    _this.setTabindexToFirstSelectedItem_();
                }
            }, 0);
        };
        /**
         * Key handler for the list.
         */
        MDCListFoundation.prototype.handleKeydown = function (evt, isRootListItem, listItemIndex) {
            var isArrowLeft = evt.key === 'ArrowLeft' || evt.keyCode === 37;
            var isArrowUp = evt.key === 'ArrowUp' || evt.keyCode === 38;
            var isArrowRight = evt.key === 'ArrowRight' || evt.keyCode === 39;
            var isArrowDown = evt.key === 'ArrowDown' || evt.keyCode === 40;
            var isHome = evt.key === 'Home' || evt.keyCode === 36;
            var isEnd = evt.key === 'End' || evt.keyCode === 35;
            var isEnter = evt.key === 'Enter' || evt.keyCode === 13;
            var isSpace = evt.key === 'Space' || evt.keyCode === 32;
            if (this.adapter_.isRootFocused()) {
                if (isArrowUp || isEnd) {
                    evt.preventDefault();
                    this.focusLastElement();
                }
                else if (isArrowDown || isHome) {
                    evt.preventDefault();
                    this.focusFirstElement();
                }
                return;
            }
            var currentIndex = this.adapter_.getFocusedElementIndex();
            if (currentIndex === -1) {
                currentIndex = listItemIndex;
                if (currentIndex < 0) {
                    // If this event doesn't have a mdc-list-item ancestor from the
                    // current list (not from a sublist), return early.
                    return;
                }
            }
            var nextIndex;
            if ((this.isVertical_ && isArrowDown) || (!this.isVertical_ && isArrowRight)) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusNextElement(currentIndex);
            }
            else if ((this.isVertical_ && isArrowUp) || (!this.isVertical_ && isArrowLeft)) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusPrevElement(currentIndex);
            }
            else if (isHome) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusFirstElement();
            }
            else if (isEnd) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusLastElement();
            }
            else if (isEnter || isSpace) {
                if (isRootListItem) {
                    // Return early if enter key is pressed on anchor element which triggers synthetic MouseEvent event.
                    var target = evt.target;
                    if (target && target.tagName === 'A' && isEnter) {
                        return;
                    }
                    this.preventDefaultEvent_(evt);
                    if (this.isSelectableList_()) {
                        this.setSelectedIndexOnAction_(currentIndex);
                    }
                    this.adapter_.notifyAction(currentIndex);
                }
            }
            this.focusedItemIndex_ = currentIndex;
            if (nextIndex !== undefined) {
                this.setTabindexAtIndex_(nextIndex);
                this.focusedItemIndex_ = nextIndex;
            }
        };
        /**
         * Click handler for the list.
         */
        MDCListFoundation.prototype.handleClick = function (index, toggleCheckbox) {
            if (index === numbers$1.UNSET_INDEX) {
                return;
            }
            if (this.isSelectableList_()) {
                this.setSelectedIndexOnAction_(index, toggleCheckbox);
            }
            this.adapter_.notifyAction(index);
            this.setTabindexAtIndex_(index);
            this.focusedItemIndex_ = index;
        };
        /**
         * Focuses the next element on the list.
         */
        MDCListFoundation.prototype.focusNextElement = function (index) {
            var count = this.adapter_.getListItemCount();
            var nextIndex = index + 1;
            if (nextIndex >= count) {
                if (this.wrapFocus_) {
                    nextIndex = 0;
                }
                else {
                    // Return early because last item is already focused.
                    return index;
                }
            }
            this.adapter_.focusItemAtIndex(nextIndex);
            return nextIndex;
        };
        /**
         * Focuses the previous element on the list.
         */
        MDCListFoundation.prototype.focusPrevElement = function (index) {
            var prevIndex = index - 1;
            if (prevIndex < 0) {
                if (this.wrapFocus_) {
                    prevIndex = this.adapter_.getListItemCount() - 1;
                }
                else {
                    // Return early because first item is already focused.
                    return index;
                }
            }
            this.adapter_.focusItemAtIndex(prevIndex);
            return prevIndex;
        };
        MDCListFoundation.prototype.focusFirstElement = function () {
            this.adapter_.focusItemAtIndex(0);
            return 0;
        };
        MDCListFoundation.prototype.focusLastElement = function () {
            var lastIndex = this.adapter_.getListItemCount() - 1;
            this.adapter_.focusItemAtIndex(lastIndex);
            return lastIndex;
        };
        /**
         * @param itemIndex Index of the list item
         * @param isEnabled Sets the list item to enabled or disabled.
         */
        MDCListFoundation.prototype.setEnabled = function (itemIndex, isEnabled) {
            if (!this.isIndexValid_(itemIndex)) {
                return;
            }
            if (isEnabled) {
                this.adapter_.removeClassForElementIndex(itemIndex, cssClasses$1.LIST_ITEM_DISABLED_CLASS);
                this.adapter_.setAttributeForElementIndex(itemIndex, strings$1.ARIA_DISABLED, 'false');
            }
            else {
                this.adapter_.addClassForElementIndex(itemIndex, cssClasses$1.LIST_ITEM_DISABLED_CLASS);
                this.adapter_.setAttributeForElementIndex(itemIndex, strings$1.ARIA_DISABLED, 'true');
            }
        };
        /**
         * Ensures that preventDefault is only called if the containing element doesn't
         * consume the event, and it will cause an unintended scroll.
         */
        MDCListFoundation.prototype.preventDefaultEvent_ = function (evt) {
            var target = evt.target;
            var tagName = ("" + target.tagName).toLowerCase();
            if (ELEMENTS_KEY_ALLOWED_IN.indexOf(tagName) === -1) {
                evt.preventDefault();
            }
        };
        MDCListFoundation.prototype.setSingleSelectionAtIndex_ = function (index) {
            if (this.selectedIndex_ === index) {
                return;
            }
            var selectedClassName = cssClasses$1.LIST_ITEM_SELECTED_CLASS;
            if (this.useActivatedClass_) {
                selectedClassName = cssClasses$1.LIST_ITEM_ACTIVATED_CLASS;
            }
            if (this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                this.adapter_.removeClassForElementIndex(this.selectedIndex_, selectedClassName);
            }
            this.adapter_.addClassForElementIndex(index, selectedClassName);
            this.setAriaForSingleSelectionAtIndex_(index);
            this.selectedIndex_ = index;
        };
        /**
         * Sets aria attribute for single selection at given index.
         */
        MDCListFoundation.prototype.setAriaForSingleSelectionAtIndex_ = function (index) {
            // Detect the presence of aria-current and get the value only during list initialization when it is in unset state.
            if (this.selectedIndex_ === numbers$1.UNSET_INDEX) {
                this.ariaCurrentAttrValue_ =
                    this.adapter_.getAttributeForElementIndex(index, strings$1.ARIA_CURRENT);
            }
            var isAriaCurrent = this.ariaCurrentAttrValue_ !== null;
            var ariaAttribute = isAriaCurrent ? strings$1.ARIA_CURRENT : strings$1.ARIA_SELECTED;
            if (this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                this.adapter_.setAttributeForElementIndex(this.selectedIndex_, ariaAttribute, 'false');
            }
            var ariaAttributeValue = isAriaCurrent ? this.ariaCurrentAttrValue_ : 'true';
            this.adapter_.setAttributeForElementIndex(index, ariaAttribute, ariaAttributeValue);
        };
        /**
         * Toggles radio at give index. Radio doesn't change the checked state if it is already checked.
         */
        MDCListFoundation.prototype.setRadioAtIndex_ = function (index) {
            this.adapter_.setCheckedCheckboxOrRadioAtIndex(index, true);
            if (this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                this.adapter_.setAttributeForElementIndex(this.selectedIndex_, strings$1.ARIA_CHECKED, 'false');
            }
            this.adapter_.setAttributeForElementIndex(index, strings$1.ARIA_CHECKED, 'true');
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setCheckboxAtIndex_ = function (index) {
            for (var i = 0; i < this.adapter_.getListItemCount(); i++) {
                var isChecked = false;
                if (index.indexOf(i) >= 0) {
                    isChecked = true;
                }
                this.adapter_.setCheckedCheckboxOrRadioAtIndex(i, isChecked);
                this.adapter_.setAttributeForElementIndex(i, strings$1.ARIA_CHECKED, isChecked ? 'true' : 'false');
            }
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setTabindexAtIndex_ = function (index) {
            if (this.focusedItemIndex_ === numbers$1.UNSET_INDEX && index !== 0) {
                // If no list item was selected set first list item's tabindex to -1.
                // Generally, tabindex is set to 0 on first list item of list that has no preselected items.
                this.adapter_.setAttributeForElementIndex(0, 'tabindex', '-1');
            }
            else if (this.focusedItemIndex_ >= 0 && this.focusedItemIndex_ !== index) {
                this.adapter_.setAttributeForElementIndex(this.focusedItemIndex_, 'tabindex', '-1');
            }
            this.adapter_.setAttributeForElementIndex(index, 'tabindex', '0');
        };
        /**
         * @return Return true if it is single selectin list, checkbox list or radio list.
         */
        MDCListFoundation.prototype.isSelectableList_ = function () {
            return this.isSingleSelectionList_ || this.isCheckboxList_ || this.isRadioList_;
        };
        MDCListFoundation.prototype.setTabindexToFirstSelectedItem_ = function () {
            var targetIndex = 0;
            if (this.isSelectableList_()) {
                if (typeof this.selectedIndex_ === 'number' && this.selectedIndex_ !== numbers$1.UNSET_INDEX) {
                    targetIndex = this.selectedIndex_;
                }
                else if (isNumberArray(this.selectedIndex_) && this.selectedIndex_.length > 0) {
                    targetIndex = this.selectedIndex_.reduce(function (currentIndex, minIndex) { return Math.min(currentIndex, minIndex); });
                }
            }
            this.setTabindexAtIndex_(targetIndex);
        };
        MDCListFoundation.prototype.isIndexValid_ = function (index) {
            var _this = this;
            if (index instanceof Array) {
                if (!this.isCheckboxList_) {
                    throw new Error('MDCListFoundation: Array of index is only supported for checkbox based list');
                }
                if (index.length === 0) {
                    return true;
                }
                else {
                    return index.some(function (i) { return _this.isIndexInRange_(i); });
                }
            }
            else if (typeof index === 'number') {
                if (this.isCheckboxList_) {
                    throw new Error('MDCListFoundation: Expected array of index for checkbox based list but got number: ' + index);
                }
                return this.isIndexInRange_(index);
            }
            else {
                return false;
            }
        };
        MDCListFoundation.prototype.isIndexInRange_ = function (index) {
            var listSize = this.adapter_.getListItemCount();
            return index >= 0 && index < listSize;
        };
        MDCListFoundation.prototype.setSelectedIndexOnAction_ = function (index, toggleCheckbox) {
            if (toggleCheckbox === void 0) { toggleCheckbox = true; }
            if (this.isCheckboxList_) {
                this.toggleCheckboxAtIndex_(index, toggleCheckbox);
            }
            else {
                this.setSelectedIndex(index);
            }
        };
        MDCListFoundation.prototype.toggleCheckboxAtIndex_ = function (index, toggleCheckbox) {
            var isChecked = this.adapter_.isCheckboxCheckedAtIndex(index);
            if (toggleCheckbox) {
                isChecked = !isChecked;
                this.adapter_.setCheckedCheckboxOrRadioAtIndex(index, isChecked);
            }
            this.adapter_.setAttributeForElementIndex(index, strings$1.ARIA_CHECKED, isChecked ? 'true' : 'false');
            // If none of the checkbox items are selected and selectedIndex is not initialized then provide a default value.
            var selectedIndexes = this.selectedIndex_ === numbers$1.UNSET_INDEX ? [] : this.selectedIndex_.slice();
            if (isChecked) {
                selectedIndexes.push(index);
            }
            else {
                selectedIndexes = selectedIndexes.filter(function (i) { return i !== index; });
            }
            this.selectedIndex_ = selectedIndexes;
        };
        return MDCListFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCList = /** @class */ (function (_super) {
        __extends(MDCList, _super);
        function MDCList() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(MDCList.prototype, "vertical", {
            set: function (value) {
                this.foundation_.setVerticalOrientation(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "listElements", {
            get: function () {
                return [].slice.call(this.root_.querySelectorAll("." + cssClasses$1.LIST_ITEM_CLASS));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "wrapFocus", {
            set: function (value) {
                this.foundation_.setWrapFocus(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "singleSelection", {
            set: function (isSingleSelectionList) {
                this.foundation_.setSingleSelection(isSingleSelectionList);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "selectedIndex", {
            get: function () {
                return this.foundation_.getSelectedIndex();
            },
            set: function (index) {
                this.foundation_.setSelectedIndex(index);
            },
            enumerable: true,
            configurable: true
        });
        MDCList.attachTo = function (root) {
            return new MDCList(root);
        };
        MDCList.prototype.initialSyncWithDOM = function () {
            this.handleClick_ = this.handleClickEvent_.bind(this);
            this.handleKeydown_ = this.handleKeydownEvent_.bind(this);
            this.focusInEventListener_ = this.handleFocusInEvent_.bind(this);
            this.focusOutEventListener_ = this.handleFocusOutEvent_.bind(this);
            this.listen('keydown', this.handleKeydown_);
            this.listen('click', this.handleClick_);
            this.listen('focusin', this.focusInEventListener_);
            this.listen('focusout', this.focusOutEventListener_);
            this.layout();
            this.initializeListType();
        };
        MDCList.prototype.destroy = function () {
            this.unlisten('keydown', this.handleKeydown_);
            this.unlisten('click', this.handleClick_);
            this.unlisten('focusin', this.focusInEventListener_);
            this.unlisten('focusout', this.focusOutEventListener_);
        };
        MDCList.prototype.layout = function () {
            var direction = this.root_.getAttribute(strings$1.ARIA_ORIENTATION);
            this.vertical = direction !== strings$1.ARIA_ORIENTATION_HORIZONTAL;
            // List items need to have at least tabindex=-1 to be focusable.
            [].slice.call(this.root_.querySelectorAll('.mdc-list-item:not([tabindex])'))
                .forEach(function (el) {
                el.setAttribute('tabindex', '-1');
            });
            // Child button/a elements are not tabbable until the list item is focused.
            [].slice.call(this.root_.querySelectorAll(strings$1.FOCUSABLE_CHILD_ELEMENTS))
                .forEach(function (el) { return el.setAttribute('tabindex', '-1'); });
            this.foundation_.layout();
        };
        /**
         * Initialize selectedIndex value based on pre-selected checkbox list items, single selection or radio.
         */
        MDCList.prototype.initializeListType = function () {
            var _this = this;
            var checkboxListItems = this.root_.querySelectorAll(strings$1.ARIA_ROLE_CHECKBOX_SELECTOR);
            var singleSelectedListItem = this.root_.querySelector("\n      ." + cssClasses$1.LIST_ITEM_ACTIVATED_CLASS + ",\n      ." + cssClasses$1.LIST_ITEM_SELECTED_CLASS + "\n    ");
            var radioSelectedListItem = this.root_.querySelector(strings$1.ARIA_CHECKED_RADIO_SELECTOR);
            if (checkboxListItems.length) {
                var preselectedItems = this.root_.querySelectorAll(strings$1.ARIA_CHECKED_CHECKBOX_SELECTOR);
                this.selectedIndex =
                    [].map.call(preselectedItems, function (listItem) { return _this.listElements.indexOf(listItem); });
            }
            else if (singleSelectedListItem) {
                if (singleSelectedListItem.classList.contains(cssClasses$1.LIST_ITEM_ACTIVATED_CLASS)) {
                    this.foundation_.setUseActivatedClass(true);
                }
                this.singleSelection = true;
                this.selectedIndex = this.listElements.indexOf(singleSelectedListItem);
            }
            else if (radioSelectedListItem) {
                this.selectedIndex = this.listElements.indexOf(radioSelectedListItem);
            }
        };
        /**
         * Updates the list item at itemIndex to the desired isEnabled state.
         * @param itemIndex Index of the list item
         * @param isEnabled Sets the list item to enabled or disabled.
         */
        MDCList.prototype.setEnabled = function (itemIndex, isEnabled) {
            this.foundation_.setEnabled(itemIndex, isEnabled);
        };
        MDCList.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                addClassForElementIndex: function (index, className) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.classList.add(className);
                    }
                },
                focusItemAtIndex: function (index) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.focus();
                    }
                },
                getAttributeForElementIndex: function (index, attr) { return _this.listElements[index].getAttribute(attr); },
                getFocusedElementIndex: function () { return _this.listElements.indexOf(document.activeElement); },
                getListItemCount: function () { return _this.listElements.length; },
                hasCheckboxAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    return !!listItem.querySelector(strings$1.CHECKBOX_SELECTOR);
                },
                hasRadioAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    return !!listItem.querySelector(strings$1.RADIO_SELECTOR);
                },
                isCheckboxCheckedAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    var toggleEl = listItem.querySelector(strings$1.CHECKBOX_SELECTOR);
                    return toggleEl.checked;
                },
                isFocusInsideList: function () {
                    return _this.root_.contains(document.activeElement);
                },
                isRootFocused: function () { return document.activeElement === _this.root_; },
                notifyAction: function (index) {
                    _this.emit(strings$1.ACTION_EVENT, { index: index }, /** shouldBubble */ true);
                },
                removeClassForElementIndex: function (index, className) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.classList.remove(className);
                    }
                },
                setAttributeForElementIndex: function (index, attr, value) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.setAttribute(attr, value);
                    }
                },
                setCheckedCheckboxOrRadioAtIndex: function (index, isChecked) {
                    var listItem = _this.listElements[index];
                    var toggleEl = listItem.querySelector(strings$1.CHECKBOX_RADIO_SELECTOR);
                    toggleEl.checked = isChecked;
                    var event = document.createEvent('Event');
                    event.initEvent('change', true, true);
                    toggleEl.dispatchEvent(event);
                },
                setTabIndexForListItemChildren: function (listItemIndex, tabIndexValue) {
                    var element = _this.listElements[listItemIndex];
                    var listItemChildren = [].slice.call(element.querySelectorAll(strings$1.CHILD_ELEMENTS_TO_TOGGLE_TABINDEX));
                    listItemChildren.forEach(function (el) { return el.setAttribute('tabindex', tabIndexValue); });
                },
            };
            return new MDCListFoundation(adapter);
        };
        /**
         * Used to figure out which list item this event is targetting. Or returns -1 if
         * there is no list item
         */
        MDCList.prototype.getListItemIndex_ = function (evt) {
            var eventTarget = evt.target;
            var nearestParent = closest(eventTarget, "." + cssClasses$1.LIST_ITEM_CLASS + ", ." + cssClasses$1.ROOT);
            // Get the index of the element if it is a list item.
            if (nearestParent && matches(nearestParent, "." + cssClasses$1.LIST_ITEM_CLASS)) {
                return this.listElements.indexOf(nearestParent);
            }
            return -1;
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleFocusInEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            this.foundation_.handleFocusIn(evt, index);
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleFocusOutEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            this.foundation_.handleFocusOut(evt, index);
        };
        /**
         * Used to figure out which element was focused when keydown event occurred before sending the event to the
         * foundation.
         */
        MDCList.prototype.handleKeydownEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            var target = evt.target;
            this.foundation_.handleKeydown(evt, target.classList.contains(cssClasses$1.LIST_ITEM_CLASS), index);
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleClickEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            var target = evt.target;
            // Toggle the checkbox only if it's not the target of the event, or the checkbox will have 2 change events.
            var toggleCheckbox = !matches(target, strings$1.CHECKBOX_RADIO_SELECTOR);
            this.foundation_.handleClick(index, toggleCheckbox);
        };
        return MDCList;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenuSurfaceFoundation = /** @class */ (function (_super) {
        __extends(MDCMenuSurfaceFoundation, _super);
        function MDCMenuSurfaceFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCMenuSurfaceFoundation.defaultAdapter, adapter)) || this;
            _this.isOpen_ = false;
            _this.isQuickOpen_ = false;
            _this.isHoistedElement_ = false;
            _this.isFixedPosition_ = false;
            _this.openAnimationEndTimerId_ = 0;
            _this.closeAnimationEndTimerId_ = 0;
            _this.animationRequestId_ = 0;
            _this.anchorCorner_ = Corner.TOP_START;
            _this.anchorMargin_ = { top: 0, right: 0, bottom: 0, left: 0 };
            _this.position_ = { x: 0, y: 0 };
            return _this;
        }
        Object.defineProperty(MDCMenuSurfaceFoundation, "cssClasses", {
            get: function () {
                return cssClasses;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "Corner", {
            get: function () {
                return Corner;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "defaultAdapter", {
            /**
             * @see {@link MDCMenuSurfaceAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    hasAnchor: function () { return false; },
                    isElementInContainer: function () { return false; },
                    isFocused: function () { return false; },
                    isRtl: function () { return false; },
                    getInnerDimensions: function () { return ({ height: 0, width: 0 }); },
                    getAnchorDimensions: function () { return null; },
                    getWindowDimensions: function () { return ({ height: 0, width: 0 }); },
                    getBodyDimensions: function () { return ({ height: 0, width: 0 }); },
                    getWindowScroll: function () { return ({ x: 0, y: 0 }); },
                    setPosition: function () { return undefined; },
                    setMaxHeight: function () { return undefined; },
                    setTransformOrigin: function () { return undefined; },
                    saveFocus: function () { return undefined; },
                    restoreFocus: function () { return undefined; },
                    notifyClose: function () { return undefined; },
                    notifyOpen: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCMenuSurfaceFoundation.prototype.init = function () {
            var _a = MDCMenuSurfaceFoundation.cssClasses, ROOT = _a.ROOT, OPEN = _a.OPEN;
            if (!this.adapter_.hasClass(ROOT)) {
                throw new Error(ROOT + " class required in root element.");
            }
            if (this.adapter_.hasClass(OPEN)) {
                this.isOpen_ = true;
            }
        };
        MDCMenuSurfaceFoundation.prototype.destroy = function () {
            clearTimeout(this.openAnimationEndTimerId_);
            clearTimeout(this.closeAnimationEndTimerId_);
            // Cancel any currently running animations.
            cancelAnimationFrame(this.animationRequestId_);
        };
        /**
         * @param corner Default anchor corner alignment of top-left menu surface corner.
         */
        MDCMenuSurfaceFoundation.prototype.setAnchorCorner = function (corner) {
            this.anchorCorner_ = corner;
        };
        /**
         * @param margin Set of margin values from anchor.
         */
        MDCMenuSurfaceFoundation.prototype.setAnchorMargin = function (margin) {
            this.anchorMargin_.top = margin.top || 0;
            this.anchorMargin_.right = margin.right || 0;
            this.anchorMargin_.bottom = margin.bottom || 0;
            this.anchorMargin_.left = margin.left || 0;
        };
        /** Used to indicate if the menu-surface is hoisted to the body. */
        MDCMenuSurfaceFoundation.prototype.setIsHoisted = function (isHoisted) {
            this.isHoistedElement_ = isHoisted;
        };
        /** Used to set the menu-surface calculations based on a fixed position menu. */
        MDCMenuSurfaceFoundation.prototype.setFixedPosition = function (isFixedPosition) {
            this.isFixedPosition_ = isFixedPosition;
        };
        /** Sets the menu-surface position on the page. */
        MDCMenuSurfaceFoundation.prototype.setAbsolutePosition = function (x, y) {
            this.position_.x = this.isFinite_(x) ? x : 0;
            this.position_.y = this.isFinite_(y) ? y : 0;
        };
        MDCMenuSurfaceFoundation.prototype.setQuickOpen = function (quickOpen) {
            this.isQuickOpen_ = quickOpen;
        };
        MDCMenuSurfaceFoundation.prototype.isOpen = function () {
            return this.isOpen_;
        };
        /**
         * Open the menu surface.
         */
        MDCMenuSurfaceFoundation.prototype.open = function () {
            var _this = this;
            this.adapter_.saveFocus();
            if (!this.isQuickOpen_) {
                this.adapter_.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
            }
            this.animationRequestId_ = requestAnimationFrame(function () {
                _this.adapter_.addClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                _this.dimensions_ = _this.adapter_.getInnerDimensions();
                _this.autoPosition_();
                if (_this.isQuickOpen_) {
                    _this.adapter_.notifyOpen();
                }
                else {
                    _this.openAnimationEndTimerId_ = setTimeout(function () {
                        _this.openAnimationEndTimerId_ = 0;
                        _this.adapter_.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
                        _this.adapter_.notifyOpen();
                    }, numbers.TRANSITION_OPEN_DURATION);
                }
            });
            this.isOpen_ = true;
        };
        /**
         * Closes the menu surface.
         */
        MDCMenuSurfaceFoundation.prototype.close = function (skipRestoreFocus) {
            var _this = this;
            if (skipRestoreFocus === void 0) { skipRestoreFocus = false; }
            if (!this.isQuickOpen_) {
                this.adapter_.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
            }
            requestAnimationFrame(function () {
                _this.adapter_.removeClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                if (_this.isQuickOpen_) {
                    _this.adapter_.notifyClose();
                }
                else {
                    _this.closeAnimationEndTimerId_ = setTimeout(function () {
                        _this.closeAnimationEndTimerId_ = 0;
                        _this.adapter_.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
                        _this.adapter_.notifyClose();
                    }, numbers.TRANSITION_CLOSE_DURATION);
                }
            });
            this.isOpen_ = false;
            if (!skipRestoreFocus) {
                this.maybeRestoreFocus_();
            }
        };
        /** Handle clicks and close if not within menu-surface element. */
        MDCMenuSurfaceFoundation.prototype.handleBodyClick = function (evt) {
            var el = evt.target;
            if (this.adapter_.isElementInContainer(el)) {
                return;
            }
            this.close();
        };
        /** Handle keys that close the surface. */
        MDCMenuSurfaceFoundation.prototype.handleKeydown = function (evt) {
            var keyCode = evt.keyCode, key = evt.key;
            var isEscape = key === 'Escape' || keyCode === 27;
            if (isEscape) {
                this.close();
            }
        };
        MDCMenuSurfaceFoundation.prototype.autoPosition_ = function () {
            var _a;
            // Compute measurements for autoposition methods reuse.
            this.measurements_ = this.getAutoLayoutMeasurements_();
            var corner = this.getOriginCorner_();
            var maxMenuSurfaceHeight = this.getMenuSurfaceMaxHeight_(corner);
            var verticalAlignment = this.hasBit_(corner, CornerBit.BOTTOM) ? 'bottom' : 'top';
            var horizontalAlignment = this.hasBit_(corner, CornerBit.RIGHT) ? 'right' : 'left';
            var horizontalOffset = this.getHorizontalOriginOffset_(corner);
            var verticalOffset = this.getVerticalOriginOffset_(corner);
            var _b = this.measurements_, anchorSize = _b.anchorSize, surfaceSize = _b.surfaceSize;
            var position = (_a = {},
                _a[horizontalAlignment] = horizontalOffset,
                _a[verticalAlignment] = verticalOffset,
                _a);
            // Center align when anchor width is comparable or greater than menu surface, otherwise keep corner.
            if (anchorSize.width / surfaceSize.width > numbers.ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO) {
                horizontalAlignment = 'center';
            }
            // If the menu-surface has been hoisted to the body, it's no longer relative to the anchor element
            if (this.isHoistedElement_ || this.isFixedPosition_) {
                this.adjustPositionForHoistedElement_(position);
            }
            this.adapter_.setTransformOrigin(horizontalAlignment + " " + verticalAlignment);
            this.adapter_.setPosition(position);
            this.adapter_.setMaxHeight(maxMenuSurfaceHeight ? maxMenuSurfaceHeight + 'px' : '');
        };
        /**
         * @return Measurements used to position menu surface popup.
         */
        MDCMenuSurfaceFoundation.prototype.getAutoLayoutMeasurements_ = function () {
            var anchorRect = this.adapter_.getAnchorDimensions();
            var bodySize = this.adapter_.getBodyDimensions();
            var viewportSize = this.adapter_.getWindowDimensions();
            var windowScroll = this.adapter_.getWindowScroll();
            if (!anchorRect) {
                // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
                anchorRect = {
                    top: this.position_.y,
                    right: this.position_.x,
                    bottom: this.position_.y,
                    left: this.position_.x,
                    width: 0,
                    height: 0,
                };
                // tslint:enable:object-literal-sort-keys
            }
            return {
                anchorSize: anchorRect,
                bodySize: bodySize,
                surfaceSize: this.dimensions_,
                viewportDistance: {
                    // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
                    top: anchorRect.top,
                    right: viewportSize.width - anchorRect.right,
                    bottom: viewportSize.height - anchorRect.bottom,
                    left: anchorRect.left,
                },
                viewportSize: viewportSize,
                windowScroll: windowScroll,
            };
        };
        /**
         * Computes the corner of the anchor from which to animate and position the menu surface.
         */
        MDCMenuSurfaceFoundation.prototype.getOriginCorner_ = function () {
            // Defaults: open from the top left.
            var corner = Corner.TOP_LEFT;
            var _a = this.measurements_, viewportDistance = _a.viewportDistance, anchorSize = _a.anchorSize, surfaceSize = _a.surfaceSize;
            var isBottomAligned = this.hasBit_(this.anchorCorner_, CornerBit.BOTTOM);
            var availableTop = isBottomAligned ? viewportDistance.top + anchorSize.height + this.anchorMargin_.bottom
                : viewportDistance.top + this.anchorMargin_.top;
            var availableBottom = isBottomAligned ? viewportDistance.bottom - this.anchorMargin_.bottom
                : viewportDistance.bottom + anchorSize.height - this.anchorMargin_.top;
            var topOverflow = surfaceSize.height - availableTop;
            var bottomOverflow = surfaceSize.height - availableBottom;
            if (bottomOverflow > 0 && topOverflow < bottomOverflow) {
                corner = this.setBit_(corner, CornerBit.BOTTOM);
            }
            var isRtl = this.adapter_.isRtl();
            var isFlipRtl = this.hasBit_(this.anchorCorner_, CornerBit.FLIP_RTL);
            var avoidHorizontalOverlap = this.hasBit_(this.anchorCorner_, CornerBit.RIGHT);
            var isAlignedRight = (avoidHorizontalOverlap && !isRtl) ||
                (!avoidHorizontalOverlap && isFlipRtl && isRtl);
            var availableLeft = isAlignedRight ? viewportDistance.left + anchorSize.width + this.anchorMargin_.right :
                viewportDistance.left + this.anchorMargin_.left;
            var availableRight = isAlignedRight ? viewportDistance.right - this.anchorMargin_.right :
                viewportDistance.right + anchorSize.width - this.anchorMargin_.left;
            var leftOverflow = surfaceSize.width - availableLeft;
            var rightOverflow = surfaceSize.width - availableRight;
            if ((leftOverflow < 0 && isAlignedRight && isRtl) ||
                (avoidHorizontalOverlap && !isAlignedRight && leftOverflow < 0) ||
                (rightOverflow > 0 && leftOverflow < rightOverflow)) {
                corner = this.setBit_(corner, CornerBit.RIGHT);
            }
            return corner;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Maximum height of the menu surface, based on available space. 0 indicates should not be set.
         */
        MDCMenuSurfaceFoundation.prototype.getMenuSurfaceMaxHeight_ = function (corner) {
            var viewportDistance = this.measurements_.viewportDistance;
            var maxHeight = 0;
            var isBottomAligned = this.hasBit_(corner, CornerBit.BOTTOM);
            var isBottomAnchored = this.hasBit_(this.anchorCorner_, CornerBit.BOTTOM);
            var MARGIN_TO_EDGE = MDCMenuSurfaceFoundation.numbers.MARGIN_TO_EDGE;
            // When maximum height is not specified, it is handled from CSS.
            if (isBottomAligned) {
                maxHeight = viewportDistance.top + this.anchorMargin_.top - MARGIN_TO_EDGE;
                if (!isBottomAnchored) {
                    maxHeight += this.measurements_.anchorSize.height;
                }
            }
            else {
                maxHeight =
                    viewportDistance.bottom - this.anchorMargin_.bottom + this.measurements_.anchorSize.height - MARGIN_TO_EDGE;
                if (isBottomAnchored) {
                    maxHeight -= this.measurements_.anchorSize.height;
                }
            }
            return maxHeight;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Horizontal offset of menu surface origin corner from corresponding anchor corner.
         */
        MDCMenuSurfaceFoundation.prototype.getHorizontalOriginOffset_ = function (corner) {
            var anchorSize = this.measurements_.anchorSize;
            // isRightAligned corresponds to using the 'right' property on the surface.
            var isRightAligned = this.hasBit_(corner, CornerBit.RIGHT);
            var avoidHorizontalOverlap = this.hasBit_(this.anchorCorner_, CornerBit.RIGHT);
            if (isRightAligned) {
                var rightOffset = avoidHorizontalOverlap ? anchorSize.width - this.anchorMargin_.left : this.anchorMargin_.right;
                // For hoisted or fixed elements, adjust the offset by the difference between viewport width and body width so
                // when we calculate the right value (`adjustPositionForHoistedElement_`) based on the element position,
                // the right property is correct.
                if (this.isHoistedElement_ || this.isFixedPosition_) {
                    return rightOffset - (this.measurements_.viewportSize.width - this.measurements_.bodySize.width);
                }
                return rightOffset;
            }
            return avoidHorizontalOverlap ? anchorSize.width - this.anchorMargin_.right : this.anchorMargin_.left;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Vertical offset of menu surface origin corner from corresponding anchor corner.
         */
        MDCMenuSurfaceFoundation.prototype.getVerticalOriginOffset_ = function (corner) {
            var anchorSize = this.measurements_.anchorSize;
            var isBottomAligned = this.hasBit_(corner, CornerBit.BOTTOM);
            var avoidVerticalOverlap = this.hasBit_(this.anchorCorner_, CornerBit.BOTTOM);
            var y = 0;
            if (isBottomAligned) {
                y = avoidVerticalOverlap ? anchorSize.height - this.anchorMargin_.top : -this.anchorMargin_.bottom;
            }
            else {
                y = avoidVerticalOverlap ? (anchorSize.height + this.anchorMargin_.bottom) : this.anchorMargin_.top;
            }
            return y;
        };
        /** Calculates the offsets for positioning the menu-surface when the menu-surface has been hoisted to the body. */
        MDCMenuSurfaceFoundation.prototype.adjustPositionForHoistedElement_ = function (position) {
            var e_1, _a;
            var _b = this.measurements_, windowScroll = _b.windowScroll, viewportDistance = _b.viewportDistance;
            var props = Object.keys(position);
            try {
                for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
                    var prop = props_1_1.value;
                    var value = position[prop] || 0;
                    // Hoisted surfaces need to have the anchor elements location on the page added to the
                    // position properties for proper alignment on the body.
                    value += viewportDistance[prop];
                    // Surfaces that are absolutely positioned need to have additional calculations for scroll
                    // and bottom positioning.
                    if (!this.isFixedPosition_) {
                        if (prop === 'top') {
                            value += windowScroll.y;
                        }
                        else if (prop === 'bottom') {
                            value -= windowScroll.y;
                        }
                        else if (prop === 'left') {
                            value += windowScroll.x;
                        }
                        else { // prop === 'right'
                            value -= windowScroll.x;
                        }
                    }
                    position[prop] = value;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * The last focused element when the menu surface was opened should regain focus, if the user is
         * focused on or within the menu surface when it is closed.
         */
        MDCMenuSurfaceFoundation.prototype.maybeRestoreFocus_ = function () {
            var isRootFocused = this.adapter_.isFocused();
            var childHasFocus = document.activeElement && this.adapter_.isElementInContainer(document.activeElement);
            if (isRootFocused || childHasFocus) {
                this.adapter_.restoreFocus();
            }
        };
        MDCMenuSurfaceFoundation.prototype.hasBit_ = function (corner, bit) {
            return Boolean(corner & bit); // tslint:disable-line:no-bitwise
        };
        MDCMenuSurfaceFoundation.prototype.setBit_ = function (corner, bit) {
            return corner | bit; // tslint:disable-line:no-bitwise
        };
        /**
         * isFinite that doesn't force conversion to number type.
         * Equivalent to Number.isFinite in ES2015, which is not supported in IE.
         */
        MDCMenuSurfaceFoundation.prototype.isFinite_ = function (num) {
            return typeof num === 'number' && isFinite(num);
        };
        return MDCMenuSurfaceFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cachedCssTransformPropertyName_;
    /**
     * Returns the name of the correct transform property to use on the current browser.
     */
    function getTransformPropertyName(globalObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        if (cachedCssTransformPropertyName_ === undefined || forceRefresh) {
            var el = globalObj.document.createElement('div');
            cachedCssTransformPropertyName_ = 'transform' in el.style ? 'transform' : 'webkitTransform';
        }
        return cachedCssTransformPropertyName_;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenuSurface = /** @class */ (function (_super) {
        __extends(MDCMenuSurface, _super);
        function MDCMenuSurface() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCMenuSurface.attachTo = function (root) {
            return new MDCMenuSurface(root);
        };
        MDCMenuSurface.prototype.initialSyncWithDOM = function () {
            var _this = this;
            var parentEl = this.root_.parentElement;
            this.anchorElement = parentEl && parentEl.classList.contains(cssClasses.ANCHOR) ? parentEl : null;
            if (this.root_.classList.contains(cssClasses.FIXED)) {
                this.setFixedPosition(true);
            }
            this.handleKeydown_ = function (evt) { return _this.foundation_.handleKeydown(evt); };
            this.handleBodyClick_ = function (evt) { return _this.foundation_.handleBodyClick(evt); };
            this.registerBodyClickListener_ = function () { return document.body.addEventListener('click', _this.handleBodyClick_); };
            this.deregisterBodyClickListener_ = function () { return document.body.removeEventListener('click', _this.handleBodyClick_); };
            this.listen('keydown', this.handleKeydown_);
            this.listen(strings.OPENED_EVENT, this.registerBodyClickListener_);
            this.listen(strings.CLOSED_EVENT, this.deregisterBodyClickListener_);
        };
        MDCMenuSurface.prototype.destroy = function () {
            this.unlisten('keydown', this.handleKeydown_);
            this.unlisten(strings.OPENED_EVENT, this.registerBodyClickListener_);
            this.unlisten(strings.CLOSED_EVENT, this.deregisterBodyClickListener_);
            _super.prototype.destroy.call(this);
        };
        MDCMenuSurface.prototype.isOpen = function () {
            return this.foundation_.isOpen();
        };
        MDCMenuSurface.prototype.open = function () {
            this.foundation_.open();
        };
        MDCMenuSurface.prototype.close = function (skipRestoreFocus) {
            if (skipRestoreFocus === void 0) { skipRestoreFocus = false; }
            this.foundation_.close(skipRestoreFocus);
        };
        Object.defineProperty(MDCMenuSurface.prototype, "quickOpen", {
            set: function (quickOpen) {
                this.foundation_.setQuickOpen(quickOpen);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Removes the menu-surface from it's current location and appends it to the
         * body to overcome any overflow:hidden issues.
         */
        MDCMenuSurface.prototype.hoistMenuToBody = function () {
            document.body.appendChild(this.root_);
            this.setIsHoisted(true);
        };
        /** Sets the foundation to use page offsets for an positioning when the menu is hoisted to the body. */
        MDCMenuSurface.prototype.setIsHoisted = function (isHoisted) {
            this.foundation_.setIsHoisted(isHoisted);
        };
        /** Sets the element that the menu-surface is anchored to. */
        MDCMenuSurface.prototype.setMenuSurfaceAnchorElement = function (element) {
            this.anchorElement = element;
        };
        /** Sets the menu-surface to position: fixed. */
        MDCMenuSurface.prototype.setFixedPosition = function (isFixed) {
            if (isFixed) {
                this.root_.classList.add(cssClasses.FIXED);
            }
            else {
                this.root_.classList.remove(cssClasses.FIXED);
            }
            this.foundation_.setFixedPosition(isFixed);
        };
        /** Sets the absolute x/y position to position based on. Requires the menu to be hoisted. */
        MDCMenuSurface.prototype.setAbsolutePosition = function (x, y) {
            this.foundation_.setAbsolutePosition(x, y);
            this.setIsHoisted(true);
        };
        /**
         * @param corner Default anchor corner alignment of top-left surface corner.
         */
        MDCMenuSurface.prototype.setAnchorCorner = function (corner) {
            this.foundation_.setAnchorCorner(corner);
        };
        MDCMenuSurface.prototype.setAnchorMargin = function (margin) {
            this.foundation_.setAnchorMargin(margin);
        };
        MDCMenuSurface.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                hasAnchor: function () { return !!_this.anchorElement; },
                notifyClose: function () { return _this.emit(MDCMenuSurfaceFoundation.strings.CLOSED_EVENT, {}); },
                notifyOpen: function () { return _this.emit(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, {}); },
                isElementInContainer: function (el) { return _this.root_.contains(el); },
                isRtl: function () { return getComputedStyle(_this.root_).getPropertyValue('direction') === 'rtl'; },
                setTransformOrigin: function (origin) {
                    var propertyName = getTransformPropertyName(window) + "-origin";
                    _this.root_.style.setProperty(propertyName, origin);
                },
                isFocused: function () { return document.activeElement === _this.root_; },
                saveFocus: function () {
                    _this.previousFocus_ = document.activeElement;
                },
                restoreFocus: function () {
                    if (_this.root_.contains(document.activeElement)) {
                        if (_this.previousFocus_ && _this.previousFocus_.focus) {
                            _this.previousFocus_.focus();
                        }
                    }
                },
                getInnerDimensions: function () {
                    return { width: _this.root_.offsetWidth, height: _this.root_.offsetHeight };
                },
                getAnchorDimensions: function () { return _this.anchorElement ? _this.anchorElement.getBoundingClientRect() : null; },
                getWindowDimensions: function () {
                    return { width: window.innerWidth, height: window.innerHeight };
                },
                getBodyDimensions: function () {
                    return { width: document.body.clientWidth, height: document.body.clientHeight };
                },
                getWindowScroll: function () {
                    return { x: window.pageXOffset, y: window.pageYOffset };
                },
                setPosition: function (position) {
                    _this.root_.style.left = 'left' in position ? position.left + "px" : '';
                    _this.root_.style.right = 'right' in position ? position.right + "px" : '';
                    _this.root_.style.top = 'top' in position ? position.top + "px" : '';
                    _this.root_.style.bottom = 'bottom' in position ? position.bottom + "px" : '';
                },
                setMaxHeight: function (height) {
                    _this.root_.style.maxHeight = height;
                },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCMenuSurfaceFoundation(adapter);
        };
        return MDCMenuSurface;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = {
        MENU_SELECTED_LIST_ITEM: 'mdc-menu-item--selected',
        MENU_SELECTION_GROUP: 'mdc-menu__selection-group',
        ROOT: 'mdc-menu',
    };
    var strings$2 = {
        ARIA_CHECKED_ATTR: 'aria-checked',
        ARIA_DISABLED_ATTR: 'aria-disabled',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]',
        LIST_SELECTOR: '.mdc-list',
        SELECTED_EVENT: 'MDCMenu:selected',
    };
    var numbers$2 = {
        FOCUS_ROOT_INDEX: -1,
    };
    var DefaultFocusState;
    (function (DefaultFocusState) {
        DefaultFocusState[DefaultFocusState["NONE"] = 0] = "NONE";
        DefaultFocusState[DefaultFocusState["LIST_ROOT"] = 1] = "LIST_ROOT";
        DefaultFocusState[DefaultFocusState["FIRST_ITEM"] = 2] = "FIRST_ITEM";
        DefaultFocusState[DefaultFocusState["LAST_ITEM"] = 3] = "LAST_ITEM";
    })(DefaultFocusState || (DefaultFocusState = {}));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenuFoundation = /** @class */ (function (_super) {
        __extends(MDCMenuFoundation, _super);
        function MDCMenuFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCMenuFoundation.defaultAdapter, adapter)) || this;
            _this.closeAnimationEndTimerId_ = 0;
            _this.defaultFocusState_ = DefaultFocusState.LIST_ROOT;
            return _this;
        }
        Object.defineProperty(MDCMenuFoundation, "cssClasses", {
            get: function () {
                return cssClasses$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "strings", {
            get: function () {
                return strings$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "numbers", {
            get: function () {
                return numbers$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "defaultAdapter", {
            /**
             * @see {@link MDCMenuAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClassToElementAtIndex: function () { return undefined; },
                    removeClassFromElementAtIndex: function () { return undefined; },
                    addAttributeToElementAtIndex: function () { return undefined; },
                    removeAttributeFromElementAtIndex: function () { return undefined; },
                    elementContainsClass: function () { return false; },
                    closeSurface: function () { return undefined; },
                    getElementIndex: function () { return -1; },
                    notifySelected: function () { return undefined; },
                    getMenuItemCount: function () { return 0; },
                    focusItemAtIndex: function () { return undefined; },
                    focusListRoot: function () { return undefined; },
                    getSelectedSiblingOfItemAtIndex: function () { return -1; },
                    isSelectableItemAtIndex: function () { return false; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCMenuFoundation.prototype.destroy = function () {
            if (this.closeAnimationEndTimerId_) {
                clearTimeout(this.closeAnimationEndTimerId_);
            }
            this.adapter_.closeSurface();
        };
        MDCMenuFoundation.prototype.handleKeydown = function (evt) {
            var key = evt.key, keyCode = evt.keyCode;
            var isTab = key === 'Tab' || keyCode === 9;
            if (isTab) {
                this.adapter_.closeSurface(/** skipRestoreFocus */ true);
            }
        };
        MDCMenuFoundation.prototype.handleItemAction = function (listItem) {
            var _this = this;
            var index = this.adapter_.getElementIndex(listItem);
            if (index < 0) {
                return;
            }
            this.adapter_.notifySelected({ index: index });
            this.adapter_.closeSurface();
            // Wait for the menu to close before adding/removing classes that affect styles.
            this.closeAnimationEndTimerId_ = setTimeout(function () {
                // Recompute the index in case the menu contents have changed.
                var recomputedIndex = _this.adapter_.getElementIndex(listItem);
                if (_this.adapter_.isSelectableItemAtIndex(recomputedIndex)) {
                    _this.setSelectedIndex(recomputedIndex);
                }
            }, MDCMenuSurfaceFoundation.numbers.TRANSITION_CLOSE_DURATION);
        };
        MDCMenuFoundation.prototype.handleMenuSurfaceOpened = function () {
            switch (this.defaultFocusState_) {
                case DefaultFocusState.FIRST_ITEM:
                    this.adapter_.focusItemAtIndex(0);
                    break;
                case DefaultFocusState.LAST_ITEM:
                    this.adapter_.focusItemAtIndex(this.adapter_.getMenuItemCount() - 1);
                    break;
                case DefaultFocusState.NONE:
                    // Do nothing.
                    break;
                default:
                    this.adapter_.focusListRoot();
                    break;
            }
        };
        /**
         * Sets default focus state where the menu should focus every time when menu
         * is opened. Focuses the list root (`DefaultFocusState.LIST_ROOT`) element by
         * default.
         */
        MDCMenuFoundation.prototype.setDefaultFocusState = function (focusState) {
            this.defaultFocusState_ = focusState;
        };
        /**
         * Selects the list item at `index` within the menu.
         * @param index Index of list item within the menu.
         */
        MDCMenuFoundation.prototype.setSelectedIndex = function (index) {
            this.validatedIndex_(index);
            if (!this.adapter_.isSelectableItemAtIndex(index)) {
                throw new Error('MDCMenuFoundation: No selection group at specified index.');
            }
            var prevSelectedIndex = this.adapter_.getSelectedSiblingOfItemAtIndex(index);
            if (prevSelectedIndex >= 0) {
                this.adapter_.removeAttributeFromElementAtIndex(prevSelectedIndex, strings$2.ARIA_CHECKED_ATTR);
                this.adapter_.removeClassFromElementAtIndex(prevSelectedIndex, cssClasses$2.MENU_SELECTED_LIST_ITEM);
            }
            this.adapter_.addClassToElementAtIndex(index, cssClasses$2.MENU_SELECTED_LIST_ITEM);
            this.adapter_.addAttributeToElementAtIndex(index, strings$2.ARIA_CHECKED_ATTR, 'true');
        };
        /**
         * Sets the enabled state to isEnabled for the menu item at the given index.
         * @param index Index of the menu item
         * @param isEnabled The desired enabled state of the menu item.
         */
        MDCMenuFoundation.prototype.setEnabled = function (index, isEnabled) {
            this.validatedIndex_(index);
            if (isEnabled) {
                this.adapter_.removeClassFromElementAtIndex(index, cssClasses$1.LIST_ITEM_DISABLED_CLASS);
                this.adapter_.addAttributeToElementAtIndex(index, strings$2.ARIA_DISABLED_ATTR, 'false');
            }
            else {
                this.adapter_.addClassToElementAtIndex(index, cssClasses$1.LIST_ITEM_DISABLED_CLASS);
                this.adapter_.addAttributeToElementAtIndex(index, strings$2.ARIA_DISABLED_ATTR, 'true');
            }
        };
        MDCMenuFoundation.prototype.validatedIndex_ = function (index) {
            var menuSize = this.adapter_.getMenuItemCount();
            var isIndexInRange = index >= 0 && index < menuSize;
            if (!isIndexInRange) {
                throw new Error('MDCMenuFoundation: No list item at specified index.');
            }
        };
        return MDCMenuFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenu = /** @class */ (function (_super) {
        __extends(MDCMenu, _super);
        function MDCMenu() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCMenu.attachTo = function (root) {
            return new MDCMenu(root);
        };
        MDCMenu.prototype.initialize = function (menuSurfaceFactory, listFactory) {
            if (menuSurfaceFactory === void 0) { menuSurfaceFactory = function (el) { return new MDCMenuSurface(el); }; }
            if (listFactory === void 0) { listFactory = function (el) { return new MDCList(el); }; }
            this.menuSurfaceFactory_ = menuSurfaceFactory;
            this.listFactory_ = listFactory;
        };
        MDCMenu.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.menuSurface_ = this.menuSurfaceFactory_(this.root_);
            var list = this.root_.querySelector(strings$2.LIST_SELECTOR);
            if (list) {
                this.list_ = this.listFactory_(list);
                this.list_.wrapFocus = true;
            }
            else {
                this.list_ = null;
            }
            this.handleKeydown_ = function (evt) { return _this.foundation_.handleKeydown(evt); };
            this.handleItemAction_ = function (evt) { return _this.foundation_.handleItemAction(_this.items[evt.detail.index]); };
            this.handleMenuSurfaceOpened_ = function () { return _this.foundation_.handleMenuSurfaceOpened(); };
            this.menuSurface_.listen(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, this.handleMenuSurfaceOpened_);
            this.listen('keydown', this.handleKeydown_);
            this.listen(MDCListFoundation.strings.ACTION_EVENT, this.handleItemAction_);
        };
        MDCMenu.prototype.destroy = function () {
            if (this.list_) {
                this.list_.destroy();
            }
            this.menuSurface_.destroy();
            this.menuSurface_.unlisten(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, this.handleMenuSurfaceOpened_);
            this.unlisten('keydown', this.handleKeydown_);
            this.unlisten(MDCListFoundation.strings.ACTION_EVENT, this.handleItemAction_);
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(MDCMenu.prototype, "open", {
            get: function () {
                return this.menuSurface_.isOpen();
            },
            set: function (value) {
                if (value) {
                    this.menuSurface_.open();
                }
                else {
                    this.menuSurface_.close();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenu.prototype, "wrapFocus", {
            get: function () {
                return this.list_ ? this.list_.wrapFocus : false;
            },
            set: function (value) {
                if (this.list_) {
                    this.list_.wrapFocus = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenu.prototype, "items", {
            /**
             * Return the items within the menu. Note that this only contains the set of elements within
             * the items container that are proper list items, and not supplemental / presentational DOM
             * elements.
             */
            get: function () {
                return this.list_ ? this.list_.listElements : [];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCMenu.prototype, "quickOpen", {
            set: function (quickOpen) {
                this.menuSurface_.quickOpen = quickOpen;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Sets default focus state where the menu should focus every time when menu
         * is opened. Focuses the list root (`DefaultFocusState.LIST_ROOT`) element by
         * default.
         * @param focusState Default focus state.
         */
        MDCMenu.prototype.setDefaultFocusState = function (focusState) {
            this.foundation_.setDefaultFocusState(focusState);
        };
        /**
         * @param corner Default anchor corner alignment of top-left menu corner.
         */
        MDCMenu.prototype.setAnchorCorner = function (corner) {
            this.menuSurface_.setAnchorCorner(corner);
        };
        MDCMenu.prototype.setAnchorMargin = function (margin) {
            this.menuSurface_.setAnchorMargin(margin);
        };
        /**
         * Sets the list item as the selected row at the specified index.
         * @param index Index of list item within menu.
         */
        MDCMenu.prototype.setSelectedIndex = function (index) {
            this.foundation_.setSelectedIndex(index);
        };
        /**
         * Sets the enabled state to isEnabled for the menu item at the given index.
         * @param index Index of the menu item
         * @param isEnabled The desired enabled state of the menu item.
         */
        MDCMenu.prototype.setEnabled = function (index, isEnabled) {
            this.foundation_.setEnabled(index, isEnabled);
        };
        /**
         * @return The item within the menu at the index specified.
         */
        MDCMenu.prototype.getOptionByIndex = function (index) {
            var items = this.items;
            if (index < items.length) {
                return this.items[index];
            }
            else {
                return null;
            }
        };
        MDCMenu.prototype.setFixedPosition = function (isFixed) {
            this.menuSurface_.setFixedPosition(isFixed);
        };
        MDCMenu.prototype.hoistMenuToBody = function () {
            this.menuSurface_.hoistMenuToBody();
        };
        MDCMenu.prototype.setIsHoisted = function (isHoisted) {
            this.menuSurface_.setIsHoisted(isHoisted);
        };
        MDCMenu.prototype.setAbsolutePosition = function (x, y) {
            this.menuSurface_.setAbsolutePosition(x, y);
        };
        /**
         * Sets the element that the menu-surface is anchored to.
         */
        MDCMenu.prototype.setAnchorElement = function (element) {
            this.menuSurface_.anchorElement = element;
        };
        MDCMenu.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClassToElementAtIndex: function (index, className) {
                    var list = _this.items;
                    list[index].classList.add(className);
                },
                removeClassFromElementAtIndex: function (index, className) {
                    var list = _this.items;
                    list[index].classList.remove(className);
                },
                addAttributeToElementAtIndex: function (index, attr, value) {
                    var list = _this.items;
                    list[index].setAttribute(attr, value);
                },
                removeAttributeFromElementAtIndex: function (index, attr) {
                    var list = _this.items;
                    list[index].removeAttribute(attr);
                },
                elementContainsClass: function (element, className) { return element.classList.contains(className); },
                closeSurface: function (skipRestoreFocus) { return _this.menuSurface_.close(skipRestoreFocus); },
                getElementIndex: function (element) { return _this.items.indexOf(element); },
                notifySelected: function (evtData) { return _this.emit(strings$2.SELECTED_EVENT, {
                    index: evtData.index,
                    item: _this.items[evtData.index],
                }); },
                getMenuItemCount: function () { return _this.items.length; },
                focusItemAtIndex: function (index) { return _this.items[index].focus(); },
                focusListRoot: function () { return _this.root_.querySelector(strings$2.LIST_SELECTOR).focus(); },
                isSelectableItemAtIndex: function (index) { return !!closest(_this.items[index], "." + cssClasses$2.MENU_SELECTION_GROUP); },
                getSelectedSiblingOfItemAtIndex: function (index) {
                    var selectionGroupEl = closest(_this.items[index], "." + cssClasses$2.MENU_SELECTION_GROUP);
                    var selectedItemEl = selectionGroupEl.querySelector("." + cssClasses$2.MENU_SELECTED_LIST_ITEM);
                    return selectedItemEl ? _this.items.indexOf(selectedItemEl) : -1;
                },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCMenuFoundation(adapter);
        };
        return MDCMenu;
    }(MDCComponent));

    /* node_modules/@smui/menu-surface/MenuSurface.svelte generated by Svelte v3.29.0 */
    const file$8 = "node_modules/@smui/menu-surface/MenuSurface.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	let div_levels = [
    		{
    			class: div_class_value = "\n    mdc-menu-surface\n    " + /*className*/ ctx[3] + "\n    " + (/*fixed*/ ctx[0] ? "mdc-menu-surface--fixed" : "") + "\n    " + (/*isStatic*/ ctx[4] ? "mdc-menu-surface--open" : "") + "\n    " + (/*isStatic*/ ctx[4] ? "smui-menu-surface--static" : "") + "\n  "
    		},
    		exclude(/*$$props*/ ctx[7], [
    			"use",
    			"class",
    			"static",
    			"anchor",
    			"fixed",
    			"open",
    			"quickOpen",
    			"anchorElement",
    			"anchorCorner",
    			"element"
    		])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[24](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[2])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[5].call(null, div)),
    					listen_dev(div, "MDCMenuSurface:closed", /*updateOpen*/ ctx[6], false, false, false),
    					listen_dev(div, "MDCMenuSurface:opened", /*updateOpen*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, fixed, isStatic*/ 25 && div_class_value !== (div_class_value = "\n    mdc-menu-surface\n    " + /*className*/ ctx[3] + "\n    " + (/*fixed*/ ctx[0] ? "mdc-menu-surface--fixed" : "") + "\n    " + (/*isStatic*/ ctx[4] ? "mdc-menu-surface--open" : "") + "\n    " + (/*isStatic*/ ctx[4] ? "smui-menu-surface--static" : "") + "\n  ")) && { class: div_class_value },
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], [
    					"use",
    					"class",
    					"static",
    					"anchor",
    					"fixed",
    					"open",
    					"quickOpen",
    					"anchorElement",
    					"anchorCorner",
    					"element"
    				])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 4) useActions_action.update.call(null, /*use*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[24](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MenuSurface", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["MDCMenuSurface:closed", "MDCMenuSurface:opened"]);
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { static: isStatic = false } = $$props;
    	let { anchor = true } = $$props;
    	let { fixed = false } = $$props;
    	let { open = isStatic } = $$props;
    	let { quickOpen = false } = $$props;
    	let { anchorElement = null } = $$props;
    	let { anchorCorner = null } = $$props;
    	let { element = undefined } = $$props; // This is exported because Menu needs it.
    	let menuSurface;
    	let instantiate = getContext("SMUI:menu-surface:instantiate");
    	let getInstance = getContext("SMUI:menu-surface:getInstance");
    	setContext("SMUI:list:role", "menu");
    	setContext("SMUI:list:item:role", "menuitem");
    	let oldFixed = null;

    	onMount(async () => {
    		if (instantiate !== false) {
    			$$invalidate(25, menuSurface = new MDCMenuSurface(element));
    		} else {
    			$$invalidate(25, menuSurface = await getInstance());
    		}
    	});

    	onDestroy(() => {
    		if (anchor) {
    			element && element.parentNode.classList.remove("mdc-menu-surface--anchor");
    		}

    		let isHoisted = false;

    		if (menuSurface) {
    			isHoisted = menuSurface.foundation_.isHoistedElement_;

    			if (instantiate !== false) {
    				menuSurface.destroy();
    			}
    		}

    		if (isHoisted) {
    			element.parentNode.removeChild(element);
    		}
    	});

    	function updateOpen() {
    		if (menuSurface) {
    			if (isStatic) {
    				$$invalidate(8, open = true);
    			} else {
    				$$invalidate(8, open = menuSurface.isOpen());
    			}
    		}
    	}

    	function setOpen(value) {
    		$$invalidate(8, open = value);
    	}

    	function setAnchorCorner(...args) {
    		return menuSurface.setAnchorCorner(...args);
    	}

    	function setAnchorMargin(...args) {
    		return menuSurface.setAnchorMargin(...args);
    	}

    	function setFixedPosition(isFixed, ...args) {
    		$$invalidate(0, fixed = isFixed);
    		return menuSurface.setFixedPosition(isFixed, ...args);
    	}

    	function setAbsolutePosition(...args) {
    		return menuSurface.setAbsolutePosition(...args);
    	}

    	function setMenuSurfaceAnchorElement(...args) {
    		return menuSurface.setMenuSurfaceAnchorElement(...args);
    	}

    	function hoistMenuToBody(...args) {
    		return menuSurface.hoistMenuToBody(...args);
    	}

    	function setIsHoisted(...args) {
    		return menuSurface.setIsHoisted(...args);
    	}

    	function getDefaultFoundation(...args) {
    		return menuSurface.getDefaultFoundation(...args);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(2, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("static" in $$new_props) $$invalidate(4, isStatic = $$new_props.static);
    		if ("anchor" in $$new_props) $$invalidate(10, anchor = $$new_props.anchor);
    		if ("fixed" in $$new_props) $$invalidate(0, fixed = $$new_props.fixed);
    		if ("open" in $$new_props) $$invalidate(8, open = $$new_props.open);
    		if ("quickOpen" in $$new_props) $$invalidate(11, quickOpen = $$new_props.quickOpen);
    		if ("anchorElement" in $$new_props) $$invalidate(9, anchorElement = $$new_props.anchorElement);
    		if ("anchorCorner" in $$new_props) $$invalidate(12, anchorCorner = $$new_props.anchorCorner);
    		if ("element" in $$new_props) $$invalidate(1, element = $$new_props.element);
    		if ("$$scope" in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Corner,
    		CornerBit,
    		MDCMenuSurface,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		isStatic,
    		anchor,
    		fixed,
    		open,
    		quickOpen,
    		anchorElement,
    		anchorCorner,
    		element,
    		menuSurface,
    		instantiate,
    		getInstance,
    		oldFixed,
    		updateOpen,
    		setOpen,
    		setAnchorCorner,
    		setAnchorMargin,
    		setFixedPosition,
    		setAbsolutePosition,
    		setMenuSurfaceAnchorElement,
    		hoistMenuToBody,
    		setIsHoisted,
    		getDefaultFoundation
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(2, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("isStatic" in $$props) $$invalidate(4, isStatic = $$new_props.isStatic);
    		if ("anchor" in $$props) $$invalidate(10, anchor = $$new_props.anchor);
    		if ("fixed" in $$props) $$invalidate(0, fixed = $$new_props.fixed);
    		if ("open" in $$props) $$invalidate(8, open = $$new_props.open);
    		if ("quickOpen" in $$props) $$invalidate(11, quickOpen = $$new_props.quickOpen);
    		if ("anchorElement" in $$props) $$invalidate(9, anchorElement = $$new_props.anchorElement);
    		if ("anchorCorner" in $$props) $$invalidate(12, anchorCorner = $$new_props.anchorCorner);
    		if ("element" in $$props) $$invalidate(1, element = $$new_props.element);
    		if ("menuSurface" in $$props) $$invalidate(25, menuSurface = $$new_props.menuSurface);
    		if ("instantiate" in $$props) instantiate = $$new_props.instantiate;
    		if ("getInstance" in $$props) getInstance = $$new_props.getInstance;
    		if ("oldFixed" in $$props) $$invalidate(26, oldFixed = $$new_props.oldFixed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*element, anchor*/ 1026) {
    			 if (element && anchor && !element.parentNode.classList.contains("mdc-menu-surface--anchor")) {
    				element.parentNode.classList.add("mdc-menu-surface--anchor");
    				$$invalidate(9, anchorElement = element.parentNode);
    			}
    		}

    		if ($$self.$$.dirty & /*menuSurface, quickOpen*/ 33556480) {
    			 if (menuSurface && menuSurface.quickOpen !== quickOpen) {
    				$$invalidate(25, menuSurface.quickOpen = quickOpen, menuSurface);
    			}
    		}

    		if ($$self.$$.dirty & /*menuSurface, anchorElement*/ 33554944) {
    			 if (menuSurface && menuSurface.anchorElement !== anchorElement) {
    				$$invalidate(25, menuSurface.anchorElement = anchorElement, menuSurface);
    			}
    		}

    		if ($$self.$$.dirty & /*menuSurface, open*/ 33554688) {
    			 if (menuSurface && menuSurface.isOpen() !== open) {
    				if (open) {
    					menuSurface.open();
    				} else {
    					menuSurface.close();
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*menuSurface, oldFixed, fixed*/ 100663297) {
    			 if (menuSurface && oldFixed !== fixed) {
    				menuSurface.setFixedPosition(fixed);
    				$$invalidate(26, oldFixed = fixed);
    			}
    		}

    		if ($$self.$$.dirty & /*menuSurface, anchorCorner*/ 33558528) {
    			 if (menuSurface && anchorCorner != null) {
    				if (Corner.hasOwnProperty(anchorCorner)) {
    					menuSurface.setAnchorCorner(Corner[anchorCorner]);
    				} else if (CornerBit.hasOwnProperty(anchorCorner)) {
    					menuSurface.setAnchorCorner(Corner[anchorCorner]);
    				} else {
    					menuSurface.setAnchorCorner(anchorCorner);
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		fixed,
    		element,
    		use,
    		className,
    		isStatic,
    		forwardEvents,
    		updateOpen,
    		$$props,
    		open,
    		anchorElement,
    		anchor,
    		quickOpen,
    		anchorCorner,
    		setOpen,
    		setAnchorCorner,
    		setAnchorMargin,
    		setFixedPosition,
    		setAbsolutePosition,
    		setMenuSurfaceAnchorElement,
    		hoistMenuToBody,
    		setIsHoisted,
    		getDefaultFoundation,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class MenuSurface extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			use: 2,
    			class: 3,
    			static: 4,
    			anchor: 10,
    			fixed: 0,
    			open: 8,
    			quickOpen: 11,
    			anchorElement: 9,
    			anchorCorner: 12,
    			element: 1,
    			setOpen: 13,
    			setAnchorCorner: 14,
    			setAnchorMargin: 15,
    			setFixedPosition: 16,
    			setAbsolutePosition: 17,
    			setMenuSurfaceAnchorElement: 18,
    			hoistMenuToBody: 19,
    			setIsHoisted: 20,
    			getDefaultFoundation: 21
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuSurface",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get use() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get static() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set static(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchor() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchor(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quickOpen() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quickOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorElement() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorElement(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorCorner() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorCorner(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx[13];
    	}

    	set setOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAnchorCorner() {
    		return this.$$.ctx[14];
    	}

    	set setAnchorCorner(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAnchorMargin() {
    		return this.$$.ctx[15];
    	}

    	set setAnchorMargin(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setFixedPosition() {
    		return this.$$.ctx[16];
    	}

    	set setFixedPosition(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAbsolutePosition() {
    		return this.$$.ctx[17];
    	}

    	set setAbsolutePosition(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setMenuSurfaceAnchorElement() {
    		return this.$$.ctx[18];
    	}

    	set setMenuSurfaceAnchorElement(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoistMenuToBody() {
    		return this.$$.ctx[19];
    	}

    	set hoistMenuToBody(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIsHoisted() {
    		return this.$$.ctx[20];
    	}

    	set setIsHoisted(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getDefaultFoundation() {
    		return this.$$.ctx[21];
    	}

    	set getDefaultFoundation(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/menu/Menu.svelte generated by Svelte v3.29.0 */

    // (1:0) <MenuSurface   bind:element   use={[forwardEvents, ...use]}   class="mdc-menu {className}"   on:MDCMenu:selected={updateOpen}   on:MDCMenuSurface:closed={updateOpen} on:MDCMenuSurface:opened={updateOpen}   {...exclude($$props, ['use', 'class', 'wrapFocus'])} >
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[25].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[27], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 134217728) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[27], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(1:0) <MenuSurface   bind:element   use={[forwardEvents, ...use]}   class=\\\"mdc-menu {className}\\\"   on:MDCMenu:selected={updateOpen}   on:MDCMenuSurface:closed={updateOpen} on:MDCMenuSurface:opened={updateOpen}   {...exclude($$props, ['use', 'class', 'wrapFocus'])} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let menusurface;
    	let updating_element;
    	let current;

    	const menusurface_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[3], .../*use*/ ctx[0]]
    		},
    		{
    			class: "mdc-menu " + /*className*/ ctx[1]
    		},
    		exclude(/*$$props*/ ctx[5], ["use", "class", "wrapFocus"])
    	];

    	function menusurface_element_binding(value) {
    		/*menusurface_element_binding*/ ctx[26].call(null, value);
    	}

    	let menusurface_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < menusurface_spread_levels.length; i += 1) {
    		menusurface_props = assign(menusurface_props, menusurface_spread_levels[i]);
    	}

    	if (/*element*/ ctx[2] !== void 0) {
    		menusurface_props.element = /*element*/ ctx[2];
    	}

    	menusurface = new MenuSurface({ props: menusurface_props, $$inline: true });
    	binding_callbacks.push(() => bind(menusurface, "element", menusurface_element_binding));
    	menusurface.$on("MDCMenu:selected", /*updateOpen*/ ctx[4]);
    	menusurface.$on("MDCMenuSurface:closed", /*updateOpen*/ ctx[4]);
    	menusurface.$on("MDCMenuSurface:opened", /*updateOpen*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(menusurface.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(menusurface, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menusurface_changes = (dirty[0] & /*forwardEvents, use, className, $$props*/ 43)
    			? get_spread_update(menusurface_spread_levels, [
    					dirty[0] & /*forwardEvents, use*/ 9 && {
    						use: [/*forwardEvents*/ ctx[3], .../*use*/ ctx[0]]
    					},
    					dirty[0] & /*className*/ 2 && {
    						class: "mdc-menu " + /*className*/ ctx[1]
    					},
    					dirty[0] & /*$$props*/ 32 && get_spread_object(exclude(/*$$props*/ ctx[5], ["use", "class", "wrapFocus"]))
    				])
    			: {};

    			if (dirty[0] & /*$$scope*/ 134217728) {
    				menusurface_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_element && dirty[0] & /*element*/ 4) {
    				updating_element = true;
    				menusurface_changes.element = /*element*/ ctx[2];
    				add_flush_callback(() => updating_element = false);
    			}

    			menusurface.$set(menusurface_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menusurface.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menusurface.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menusurface, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["MDCMenu:selected", "MDCMenuSurface:closed", "MDCMenuSurface:opened"]);
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { static: isStatic = false } = $$props;
    	let { open = isStatic } = $$props; // Purposely omitted from the exclude call above.
    	let { quickOpen = false } = $$props; // Purposely omitted from the exclude call above.
    	let { anchorCorner = null } = $$props; // Purposely omitted from the exclude call above.
    	let { wrapFocus = false } = $$props;
    	let element;
    	let menu;
    	let instantiate = getContext("SMUI:menu:instantiate");
    	let getInstance = getContext("SMUI:menu:getInstance");
    	let menuSurfacePromiseResolve;
    	let menuSurfacePromise = new Promise(resolve => menuSurfacePromiseResolve = resolve);
    	let listPromiseResolve;
    	let listPromise = new Promise(resolve => listPromiseResolve = resolve);
    	setContext("SMUI:menu-surface:instantiate", false);
    	setContext("SMUI:menu-surface:getInstance", getMenuSurfaceInstancePromise);
    	setContext("SMUI:list:instantiate", false);
    	setContext("SMUI:list:getInstance", getListInstancePromise);

    	onMount(async () => {
    		if (instantiate !== false) {
    			$$invalidate(28, menu = new MDCMenu(element));
    		} else {
    			$$invalidate(28, menu = await getInstance());
    		}

    		menuSurfacePromiseResolve(menu.menuSurface_);
    		listPromiseResolve(menu.list_);
    	});

    	onDestroy(() => {
    		if (instantiate !== false) {
    			menu && menu.destroy();
    		}
    	});

    	function getMenuSurfaceInstancePromise() {
    		return menuSurfacePromise;
    	}

    	function getListInstancePromise() {
    		return listPromise;
    	}

    	function updateOpen() {
    		$$invalidate(6, open = menu.open);
    	}

    	function setOpen(value) {
    		$$invalidate(6, open = value);
    	}

    	function getItems() {
    		return menu.items;
    	}

    	function setDefaultFocusState(...args) {
    		return menu.setDefaultFocusState(...args);
    	}

    	function setAnchorCorner(...args) {
    		return menu.setAnchorCorner(...args);
    	}

    	function setAnchorMargin(...args) {
    		return menu.setAnchorMargin(...args);
    	}

    	function setSelectedIndex(...args) {
    		return menu.setSelectedIndex(...args);
    	}

    	function setEnabled(...args) {
    		return menu.setEnabled(...args);
    	}

    	function getOptionByIndex(...args) {
    		return menu.getOptionByIndex(...args);
    	}

    	function setFixedPosition(...args) {
    		return menu.setFixedPosition(...args);
    	}

    	function hoistMenuToBody(...args) {
    		return menu.hoistMenuToBody(...args);
    	}

    	function setIsHoisted(...args) {
    		return menu.setIsHoisted(...args);
    	}

    	function setAbsolutePosition(...args) {
    		return menu.setAbsolutePosition(...args);
    	}

    	function setAnchorElement(...args) {
    		return menu.setAnchorElement(...args);
    	}

    	function getDefaultFoundation(...args) {
    		return menu.getDefaultFoundation(...args);
    	}

    	function menusurface_element_binding(value) {
    		element = value;
    		$$invalidate(2, element);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("static" in $$new_props) $$invalidate(7, isStatic = $$new_props.static);
    		if ("open" in $$new_props) $$invalidate(6, open = $$new_props.open);
    		if ("quickOpen" in $$new_props) $$invalidate(8, quickOpen = $$new_props.quickOpen);
    		if ("anchorCorner" in $$new_props) $$invalidate(9, anchorCorner = $$new_props.anchorCorner);
    		if ("wrapFocus" in $$new_props) $$invalidate(10, wrapFocus = $$new_props.wrapFocus);
    		if ("$$scope" in $$new_props) $$invalidate(27, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCMenu,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		MenuSurface,
    		Corner,
    		CornerBit,
    		forwardEvents,
    		use,
    		className,
    		isStatic,
    		open,
    		quickOpen,
    		anchorCorner,
    		wrapFocus,
    		element,
    		menu,
    		instantiate,
    		getInstance,
    		menuSurfacePromiseResolve,
    		menuSurfacePromise,
    		listPromiseResolve,
    		listPromise,
    		getMenuSurfaceInstancePromise,
    		getListInstancePromise,
    		updateOpen,
    		setOpen,
    		getItems,
    		setDefaultFocusState,
    		setAnchorCorner,
    		setAnchorMargin,
    		setSelectedIndex,
    		setEnabled,
    		getOptionByIndex,
    		setFixedPosition,
    		hoistMenuToBody,
    		setIsHoisted,
    		setAbsolutePosition,
    		setAnchorElement,
    		getDefaultFoundation
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("isStatic" in $$props) $$invalidate(7, isStatic = $$new_props.isStatic);
    		if ("open" in $$props) $$invalidate(6, open = $$new_props.open);
    		if ("quickOpen" in $$props) $$invalidate(8, quickOpen = $$new_props.quickOpen);
    		if ("anchorCorner" in $$props) $$invalidate(9, anchorCorner = $$new_props.anchorCorner);
    		if ("wrapFocus" in $$props) $$invalidate(10, wrapFocus = $$new_props.wrapFocus);
    		if ("element" in $$props) $$invalidate(2, element = $$new_props.element);
    		if ("menu" in $$props) $$invalidate(28, menu = $$new_props.menu);
    		if ("instantiate" in $$props) instantiate = $$new_props.instantiate;
    		if ("getInstance" in $$props) getInstance = $$new_props.getInstance;
    		if ("menuSurfacePromiseResolve" in $$props) menuSurfacePromiseResolve = $$new_props.menuSurfacePromiseResolve;
    		if ("menuSurfacePromise" in $$props) menuSurfacePromise = $$new_props.menuSurfacePromise;
    		if ("listPromiseResolve" in $$props) listPromiseResolve = $$new_props.listPromiseResolve;
    		if ("listPromise" in $$props) listPromise = $$new_props.listPromise;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*menu, open, isStatic*/ 268435648) {
    			 if (menu && menu.open !== open) {
    				if (isStatic) {
    					$$invalidate(6, open = true);
    				}

    				$$invalidate(28, menu.open = open, menu);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*menu, wrapFocus*/ 268436480) {
    			 if (menu && menu.wrapFocus !== wrapFocus) {
    				$$invalidate(28, menu.wrapFocus = wrapFocus, menu);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*menu, quickOpen*/ 268435712) {
    			 if (menu) {
    				$$invalidate(28, menu.quickOpen = quickOpen, menu);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*menu, anchorCorner*/ 268435968) {
    			 if (menu && anchorCorner != null) {
    				if (Corner.hasOwnProperty(anchorCorner)) {
    					menu.setAnchorCorner(Corner[anchorCorner]);
    				} else if (CornerBit.hasOwnProperty(anchorCorner)) {
    					menu.setAnchorCorner(Corner[anchorCorner]);
    				} else {
    					menu.setAnchorCorner(anchorCorner);
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		element,
    		forwardEvents,
    		updateOpen,
    		$$props,
    		open,
    		isStatic,
    		quickOpen,
    		anchorCorner,
    		wrapFocus,
    		setOpen,
    		getItems,
    		setDefaultFocusState,
    		setAnchorCorner,
    		setAnchorMargin,
    		setSelectedIndex,
    		setEnabled,
    		getOptionByIndex,
    		setFixedPosition,
    		hoistMenuToBody,
    		setIsHoisted,
    		setAbsolutePosition,
    		setAnchorElement,
    		getDefaultFoundation,
    		slots,
    		menusurface_element_binding,
    		$$scope
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				static: 7,
    				open: 6,
    				quickOpen: 8,
    				anchorCorner: 9,
    				wrapFocus: 10,
    				setOpen: 11,
    				getItems: 12,
    				setDefaultFocusState: 13,
    				setAnchorCorner: 14,
    				setAnchorMargin: 15,
    				setSelectedIndex: 16,
    				setEnabled: 17,
    				getOptionByIndex: 18,
    				setFixedPosition: 19,
    				hoistMenuToBody: 20,
    				setIsHoisted: 21,
    				setAbsolutePosition: 22,
    				setAnchorElement: 23,
    				getDefaultFoundation: 24
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get use() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get static() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set static(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quickOpen() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quickOpen(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorCorner() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorCorner(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapFocus() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapFocus(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx[11];
    	}

    	set setOpen(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getItems() {
    		return this.$$.ctx[12];
    	}

    	set getItems(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setDefaultFocusState() {
    		return this.$$.ctx[13];
    	}

    	set setDefaultFocusState(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAnchorCorner() {
    		return this.$$.ctx[14];
    	}

    	set setAnchorCorner(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAnchorMargin() {
    		return this.$$.ctx[15];
    	}

    	set setAnchorMargin(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setSelectedIndex() {
    		return this.$$.ctx[16];
    	}

    	set setSelectedIndex(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setEnabled() {
    		return this.$$.ctx[17];
    	}

    	set setEnabled(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getOptionByIndex() {
    		return this.$$.ctx[18];
    	}

    	set getOptionByIndex(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setFixedPosition() {
    		return this.$$.ctx[19];
    	}

    	set setFixedPosition(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hoistMenuToBody() {
    		return this.$$.ctx[20];
    	}

    	set hoistMenuToBody(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIsHoisted() {
    		return this.$$.ctx[21];
    	}

    	set setIsHoisted(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAbsolutePosition() {
    		return this.$$.ctx[22];
    	}

    	set setAbsolutePosition(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAnchorElement() {
    		return this.$$.ctx[23];
    	}

    	set setAnchorElement(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getDefaultFoundation() {
    		return this.$$.ctx[24];
    	}

    	set getDefaultFoundation(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function prefixFilter(obj, prefix) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (name.substring(0, prefix.length) === prefix) {
          newObj[name.substring(prefix.length)] = obj[name];
        }
      }

      return newObj;
    }

    /* node_modules/@smui/common/Span.svelte generated by Svelte v3.29.0 */
    const file$9 = "node_modules/@smui/common/Span.svelte";

    function create_fragment$c(ctx) {
    	let span;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let span_levels = [exclude(/*$$props*/ ctx[2], ["use"])];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use"])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Span", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class Span extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { use: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Span",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get use() {
    		throw new Error("<Span>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Span>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Graphic = classAdderBuilder({
      class: 'mdc-list-item__graphic',
      component: Span,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-menu__selection-group-icon',
      component: Graphic,
      contexts: {}
    });

    /* node_modules/@smui/list/List.svelte generated by Svelte v3.29.0 */
    const file$a = "node_modules/@smui/list/List.svelte";

    // (18:0) {:else}
    function create_else_block(ctx) {
    	let ul;
    	let ul_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	let ul_levels = [
    		{
    			class: ul_class_value = "\n      mdc-list\n      " + /*className*/ ctx[1] + "\n      " + (/*nonInteractive*/ ctx[2]
    			? "mdc-list--non-interactive"
    			: "") + "\n      " + (/*dense*/ ctx[3] ? "mdc-list--dense" : "") + "\n      " + (/*avatarList*/ ctx[4] ? "mdc-list--avatar-list" : "") + "\n      " + (/*twoLine*/ ctx[5] ? "mdc-list--two-line" : "") + "\n      " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    			? "smui-list--three-line"
    			: "") + "\n    "
    		},
    		{ role: /*role*/ ctx[8] },
    		/*props*/ ctx[9]
    	];

    	let ul_data = {};

    	for (let i = 0; i < ul_levels.length; i += 1) {
    		ul_data = assign(ul_data, ul_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			set_attributes(ul, ul_data);
    			add_location(ul, file$a, 18, 2, 478);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			/*ul_binding*/ ctx[25](ul);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, ul, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[10].call(null, ul)),
    					listen_dev(ul, "MDCList:action", /*handleAction*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			set_attributes(ul, ul_data = get_spread_update(ul_levels, [
    				(!current || dirty[0] & /*className, nonInteractive, dense, avatarList, twoLine, threeLine*/ 126 && ul_class_value !== (ul_class_value = "\n      mdc-list\n      " + /*className*/ ctx[1] + "\n      " + (/*nonInteractive*/ ctx[2]
    				? "mdc-list--non-interactive"
    				: "") + "\n      " + (/*dense*/ ctx[3] ? "mdc-list--dense" : "") + "\n      " + (/*avatarList*/ ctx[4] ? "mdc-list--avatar-list" : "") + "\n      " + (/*twoLine*/ ctx[5] ? "mdc-list--two-line" : "") + "\n      " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    				? "smui-list--three-line"
    				: "") + "\n    ")) && { class: ul_class_value },
    				(!current || dirty[0] & /*role*/ 256) && { role: /*role*/ ctx[8] },
    				dirty[0] & /*props*/ 512 && /*props*/ ctx[9]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    			/*ul_binding*/ ctx[25](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(18:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if nav}
    function create_if_block$2(ctx) {
    	let nav_1;
    	let nav_1_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	let nav_1_levels = [
    		{
    			class: nav_1_class_value = "\n      mdc-list\n      " + /*className*/ ctx[1] + "\n      " + (/*nonInteractive*/ ctx[2]
    			? "mdc-list--non-interactive"
    			: "") + "\n      " + (/*dense*/ ctx[3] ? "mdc-list--dense" : "") + "\n      " + (/*avatarList*/ ctx[4] ? "mdc-list--avatar-list" : "") + "\n      " + (/*twoLine*/ ctx[5] ? "mdc-list--two-line" : "") + "\n      " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    			? "smui-list--three-line"
    			: "") + "\n    "
    		},
    		/*props*/ ctx[9]
    	];

    	let nav_1_data = {};

    	for (let i = 0; i < nav_1_levels.length; i += 1) {
    		nav_1_data = assign(nav_1_data, nav_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			nav_1 = element("nav");
    			if (default_slot) default_slot.c();
    			set_attributes(nav_1, nav_1_data);
    			add_location(nav_1, file$a, 1, 2, 12);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav_1, anchor);

    			if (default_slot) {
    				default_slot.m(nav_1, null);
    			}

    			/*nav_1_binding*/ ctx[24](nav_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, nav_1, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[10].call(null, nav_1)),
    					listen_dev(nav_1, "MDCList:action", /*handleAction*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			set_attributes(nav_1, nav_1_data = get_spread_update(nav_1_levels, [
    				(!current || dirty[0] & /*className, nonInteractive, dense, avatarList, twoLine, threeLine*/ 126 && nav_1_class_value !== (nav_1_class_value = "\n      mdc-list\n      " + /*className*/ ctx[1] + "\n      " + (/*nonInteractive*/ ctx[2]
    				? "mdc-list--non-interactive"
    				: "") + "\n      " + (/*dense*/ ctx[3] ? "mdc-list--dense" : "") + "\n      " + (/*avatarList*/ ctx[4] ? "mdc-list--avatar-list" : "") + "\n      " + (/*twoLine*/ ctx[5] ? "mdc-list--two-line" : "") + "\n      " + (/*threeLine*/ ctx[6] && !/*twoLine*/ ctx[5]
    				? "smui-list--three-line"
    				: "") + "\n    ")) && { class: nav_1_class_value },
    				dirty[0] & /*props*/ 512 && /*props*/ ctx[9]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav_1);
    			if (default_slot) default_slot.d(detaching);
    			/*nav_1_binding*/ ctx[24](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(1:0) {#if nav}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nav*/ ctx[11]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["MDCList:action"]);
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { nonInteractive = false } = $$props;
    	let { dense = false } = $$props;
    	let { avatarList = false } = $$props;
    	let { twoLine = false } = $$props;
    	let { threeLine = false } = $$props;
    	let { vertical = true } = $$props;
    	let { wrapFocus = false } = $$props;
    	let { singleSelection = false } = $$props;
    	let { selectedIndex = null } = $$props;
    	let { radiolist = false } = $$props;
    	let { checklist = false } = $$props;
    	let element;
    	let list;
    	let role = getContext("SMUI:list:role");
    	let nav = getContext("SMUI:list:nav");
    	let instantiate = getContext("SMUI:list:instantiate");
    	let getInstance = getContext("SMUI:list:getInstance");
    	let addLayoutListener = getContext("SMUI:addLayoutListener");
    	let removeLayoutListener;
    	setContext("SMUI:list:nonInteractive", nonInteractive);

    	if (!role) {
    		if (singleSelection) {
    			role = "listbox";
    			setContext("SMUI:list:item:role", "option");
    		} else if (radiolist) {
    			role = "radiogroup";
    			setContext("SMUI:list:item:role", "radio");
    		} else if (checklist) {
    			role = "group";
    			setContext("SMUI:list:item:role", "checkbox");
    		} else {
    			role = "list";
    			setContext("SMUI:list:item:role", undefined);
    		}
    	}

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(async () => {
    		if (instantiate !== false) {
    			$$invalidate(26, list = new MDCList(element));
    		} else {
    			$$invalidate(26, list = await getInstance());
    		}

    		if (singleSelection) {
    			list.initializeListType();
    			$$invalidate(13, selectedIndex = list.selectedIndex);
    		}
    	});

    	onDestroy(() => {
    		if (instantiate !== false) {
    			list && list.destroy();
    		}

    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function handleAction(e) {
    		if (list && list.listElements[e.detail.index].classList.contains("mdc-list-item--disabled")) {
    			e.preventDefault();
    			$$invalidate(26, list.selectedIndex = selectedIndex, list);
    		} else if (list && list.selectedIndex === e.detail.index) {
    			$$invalidate(13, selectedIndex = e.detail.index);
    		}
    	}

    	function layout(...args) {
    		return list.layout(...args);
    	}

    	function setEnabled(...args) {
    		return list.setEnabled(...args);
    	}

    	function getDefaultFoundation(...args) {
    		return list.getDefaultFoundation(...args);
    	}

    	function nav_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(31, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("nonInteractive" in $$new_props) $$invalidate(2, nonInteractive = $$new_props.nonInteractive);
    		if ("dense" in $$new_props) $$invalidate(3, dense = $$new_props.dense);
    		if ("avatarList" in $$new_props) $$invalidate(4, avatarList = $$new_props.avatarList);
    		if ("twoLine" in $$new_props) $$invalidate(5, twoLine = $$new_props.twoLine);
    		if ("threeLine" in $$new_props) $$invalidate(6, threeLine = $$new_props.threeLine);
    		if ("vertical" in $$new_props) $$invalidate(14, vertical = $$new_props.vertical);
    		if ("wrapFocus" in $$new_props) $$invalidate(15, wrapFocus = $$new_props.wrapFocus);
    		if ("singleSelection" in $$new_props) $$invalidate(16, singleSelection = $$new_props.singleSelection);
    		if ("selectedIndex" in $$new_props) $$invalidate(13, selectedIndex = $$new_props.selectedIndex);
    		if ("radiolist" in $$new_props) $$invalidate(17, radiolist = $$new_props.radiolist);
    		if ("checklist" in $$new_props) $$invalidate(18, checklist = $$new_props.checklist);
    		if ("$$scope" in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCList,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		nonInteractive,
    		dense,
    		avatarList,
    		twoLine,
    		threeLine,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		selectedIndex,
    		radiolist,
    		checklist,
    		element,
    		list,
    		role,
    		nav,
    		instantiate,
    		getInstance,
    		addLayoutListener,
    		removeLayoutListener,
    		handleAction,
    		layout,
    		setEnabled,
    		getDefaultFoundation,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(31, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("nonInteractive" in $$props) $$invalidate(2, nonInteractive = $$new_props.nonInteractive);
    		if ("dense" in $$props) $$invalidate(3, dense = $$new_props.dense);
    		if ("avatarList" in $$props) $$invalidate(4, avatarList = $$new_props.avatarList);
    		if ("twoLine" in $$props) $$invalidate(5, twoLine = $$new_props.twoLine);
    		if ("threeLine" in $$props) $$invalidate(6, threeLine = $$new_props.threeLine);
    		if ("vertical" in $$props) $$invalidate(14, vertical = $$new_props.vertical);
    		if ("wrapFocus" in $$props) $$invalidate(15, wrapFocus = $$new_props.wrapFocus);
    		if ("singleSelection" in $$props) $$invalidate(16, singleSelection = $$new_props.singleSelection);
    		if ("selectedIndex" in $$props) $$invalidate(13, selectedIndex = $$new_props.selectedIndex);
    		if ("radiolist" in $$props) $$invalidate(17, radiolist = $$new_props.radiolist);
    		if ("checklist" in $$props) $$invalidate(18, checklist = $$new_props.checklist);
    		if ("element" in $$props) $$invalidate(7, element = $$new_props.element);
    		if ("list" in $$props) $$invalidate(26, list = $$new_props.list);
    		if ("role" in $$props) $$invalidate(8, role = $$new_props.role);
    		if ("nav" in $$props) $$invalidate(11, nav = $$new_props.nav);
    		if ("instantiate" in $$props) instantiate = $$new_props.instantiate;
    		if ("getInstance" in $$props) getInstance = $$new_props.getInstance;
    		if ("addLayoutListener" in $$props) addLayoutListener = $$new_props.addLayoutListener;
    		if ("removeLayoutListener" in $$props) removeLayoutListener = $$new_props.removeLayoutListener;
    		if ("props" in $$props) $$invalidate(9, props = $$new_props.props);
    	};

    	let props;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(9, props = exclude($$props, [
    			"use",
    			"class",
    			"nonInteractive",
    			"dense",
    			"avatarList",
    			"twoLine",
    			"threeLine",
    			"vertical",
    			"wrapFocus",
    			"singleSelection",
    			"selectedIndex",
    			"radiolist",
    			"checklist"
    		]));

    		if ($$self.$$.dirty[0] & /*list, vertical*/ 67125248) {
    			 if (list && list.vertical !== vertical) {
    				$$invalidate(26, list.vertical = vertical, list);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*list, wrapFocus*/ 67141632) {
    			 if (list && list.wrapFocus !== wrapFocus) {
    				$$invalidate(26, list.wrapFocus = wrapFocus, list);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*list, singleSelection*/ 67174400) {
    			 if (list && list.singleSelection !== singleSelection) {
    				$$invalidate(26, list.singleSelection = singleSelection, list);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*list, singleSelection, selectedIndex*/ 67182592) {
    			 if (list && singleSelection && list.selectedIndex !== selectedIndex) {
    				$$invalidate(26, list.selectedIndex = selectedIndex, list);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		nonInteractive,
    		dense,
    		avatarList,
    		twoLine,
    		threeLine,
    		element,
    		role,
    		props,
    		forwardEvents,
    		nav,
    		handleAction,
    		selectedIndex,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		radiolist,
    		checklist,
    		layout,
    		setEnabled,
    		getDefaultFoundation,
    		$$scope,
    		slots,
    		nav_1_binding,
    		ul_binding
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$d,
    			create_fragment$d,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				nonInteractive: 2,
    				dense: 3,
    				avatarList: 4,
    				twoLine: 5,
    				threeLine: 6,
    				vertical: 14,
    				wrapFocus: 15,
    				singleSelection: 16,
    				selectedIndex: 13,
    				radiolist: 17,
    				checklist: 18,
    				layout: 19,
    				setEnabled: 20,
    				getDefaultFoundation: 21
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get use() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatarList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatarList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get twoLine() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set twoLine(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threeLine() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threeLine(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapFocus() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapFocus(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get singleSelection() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set singleSelection(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radiolist() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radiolist(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checklist() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checklist(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx[19];
    	}

    	set layout(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setEnabled() {
    		return this.$$.ctx[20];
    	}

    	set setEnabled(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getDefaultFoundation() {
    		return this.$$.ctx[21];
    	}

    	set getDefaultFoundation(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function detectEdgePseudoVarBug(windowObj) {
        // Detect versions of Edge with buggy var() support
        // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/
        var document = windowObj.document;
        var node = document.createElement('div');
        node.className = 'mdc-ripple-surface--test-edge-var-bug';
        // Append to head instead of body because this script might be invoked in the
        // head, in which case the body doesn't exist yet. The probe works either way.
        document.head.appendChild(node);
        // The bug exists if ::before style ends up propagating to the parent element.
        // Additionally, getComputedStyle returns null in iframes with display: "none" in Firefox,
        // but Firefox is known to support CSS custom properties correctly.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        var computedStyle = windowObj.getComputedStyle(node);
        var hasPseudoVarBug = computedStyle !== null && computedStyle.borderTopStyle === 'solid';
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return hasPseudoVarBug;
    }
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        if (explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus) {
            supportsCssVars = !detectEdgePseudoVarBug(windowObj);
        }
        else {
            supportsCssVars = false;
        }
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Stores result from applyPassive to avoid redundant processing to detect
     * passive event listener support.
     */
    var supportsPassive_;
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive(globalObj, forceRefresh) {
        if (globalObj === void 0) { globalObj = window; }
        if (forceRefresh === void 0) { forceRefresh = false; }
        if (supportsPassive_ === undefined || forceRefresh) {
            var isSupported_1 = false;
            try {
                globalObj.document.addEventListener('test', function () { return undefined; }, {
                    get passive() {
                        isSupported_1 = true;
                        return isSupported_1;
                    },
                });
            }
            catch (e) {
            } // tslint:disable-line:no-empty cannot throw error due to tests. tslint also disables console.log.
            supportsPassive_ = isSupported_1;
        }
        return supportsPassive_ ? { passive: true } : false;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$3 = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings$3 = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers$3 = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300,
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCRippleFoundation.defaultAdapter, adapter)) || this;
            _this.activationAnimationHasEnded_ = false;
            _this.activationTimer_ = 0;
            _this.fgDeactivationRemovalTimer_ = 0;
            _this.fgScale_ = '0';
            _this.frame_ = { width: 0, height: 0 };
            _this.initialSize_ = 0;
            _this.layoutFrame_ = 0;
            _this.maxRadius_ = 0;
            _this.unboundedCoords_ = { left: 0, top: 0 };
            _this.activationState_ = _this.defaultActivationState_();
            _this.activationTimerCallback_ = function () {
                _this.activationAnimationHasEnded_ = true;
                _this.runDeactivationUXLogicIfReady_();
            };
            _this.activateHandler_ = function (e) { return _this.activate_(e); };
            _this.deactivateHandler_ = function () { return _this.deactivate_(); };
            _this.focusHandler_ = function () { return _this.handleFocus(); };
            _this.blurHandler_ = function () { return _this.handleBlur(); };
            _this.resizeHandler_ = function () { return _this.layout(); };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple_();
            this.registerRootHandlers_(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.addClass(ROOT_1);
                    if (_this.adapter_.isUnbounded()) {
                        _this.adapter_.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal_();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple_()) {
                if (this.activationTimer_) {
                    clearTimeout(this.activationTimer_);
                    this.activationTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer_) {
                    clearTimeout(this.fgDeactivationRemovalTimer_);
                    this.fgDeactivationRemovalTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.removeClass(ROOT_2);
                    _this.adapter_.removeClass(UNBOUNDED_2);
                    _this.removeCssVars_();
                });
            }
            this.deregisterRootHandlers_();
            this.deregisterDeactivationHandlers_();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activate_(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivate_();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame_) {
                cancelAnimationFrame(this.layoutFrame_);
            }
            this.layoutFrame_ = requestAnimationFrame(function () {
                _this.layoutInternal_();
                _this.layoutFrame_ = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter_.addClass(UNBOUNDED);
            }
            else {
                this.adapter_.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
            return this.adapter_.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState_ = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
            var _this = this;
            if (supportsPressRipple) {
                ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerInteractionHandler(evtType, _this.activateHandler_);
                });
                if (this.adapter_.isUnbounded()) {
                    this.adapter_.registerResizeHandler(this.resizeHandler_);
                }
            }
            this.adapter_.registerInteractionHandler('focus', this.focusHandler_);
            this.adapter_.registerInteractionHandler('blur', this.blurHandler_);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
            var _this = this;
            if (evt.type === 'keydown') {
                this.adapter_.registerInteractionHandler('keyup', this.deactivateHandler_);
            }
            else {
                POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
                });
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
            var _this = this;
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterInteractionHandler(evtType, _this.activateHandler_);
            });
            this.adapter_.deregisterInteractionHandler('focus', this.focusHandler_);
            this.adapter_.deregisterInteractionHandler('blur', this.blurHandler_);
            if (this.adapter_.isUnbounded()) {
                this.adapter_.deregisterResizeHandler(this.resizeHandler_);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
            var _this = this;
            this.adapter_.deregisterInteractionHandler('keyup', this.deactivateHandler_);
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        };
        MDCRippleFoundation.prototype.removeCssVars_ = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter_.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activate_ = function (evt) {
            var _this = this;
            if (this.adapter_.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState_;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent_;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined && activatedTargets.length > 0 && activatedTargets.some(function (target) { return _this.adapter_.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState_();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers_(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation_();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation_();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState_ = _this.defaultActivationState_();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ? this.adapter_.isSurfaceActive() : true;
        };
        MDCRippleFoundation.prototype.animateActivation_ = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal_();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter_.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer_);
            clearTimeout(this.fgDeactivationRemovalTimer_);
            this.rmBoundedActivationClasses_();
            this.adapter_.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter_.computeBoundingRect();
            this.adapter_.addClass(FG_ACTIVATION);
            this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
            var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter_.getWindowPageOffset(), this.adapter_.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame_.width / 2,
                    y: this.frame_.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize_ / 2),
                y: startPoint.y - (this.initialSize_ / 2),
            };
            var endPoint = {
                x: (this.frame_.width / 2) - (this.initialSize_ / 2),
                y: (this.frame_.height / 2) - (this.initialSize_ / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded_) {
                this.rmBoundedActivationClasses_();
                this.adapter_.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                    _this.adapter_.removeClass(FG_DEACTIVATION);
                }, numbers$3.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter_.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded_ = false;
            this.adapter_.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState_ = function () {
            var _this = this;
            this.previousActivationEvent_ = this.activationState_.activationEvent;
            this.activationState_ = this.defaultActivationState_();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivate_ = function () {
            var _this = this;
            var activationState = this.activationState_;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
                this.resetActivationState_();
            }
            else {
                this.deregisterDeactivationHandlers_();
                requestAnimationFrame(function () {
                    _this.activationState_.hasDeactivationUXRun = true;
                    _this.animateDeactivation_(state);
                    _this.resetActivationState_();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady_();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal_ = function () {
            var _this = this;
            this.frame_ = this.adapter_.computeBoundingRect();
            var maxDim = Math.max(this.frame_.height, this.frame_.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius_ = this.adapter_.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            this.initialSize_ = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
            this.updateLayoutCssVars_();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter_.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
            this.adapter_.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
            if (this.adapter_.isUnbounded()) {
                this.unboundedCoords_ = {
                    left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                    top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
                };
                this.adapter_.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
                this.adapter_.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCRipple = /** @class */ (function (_super) {
        __extends(MDCRipple, _super);
        function MDCRipple() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.disabled = false;
            return _this;
        }
        MDCRipple.attachTo = function (root, opts) {
            if (opts === void 0) { opts = { isUnbounded: undefined }; }
            var ripple = new MDCRipple(root);
            // Only override unbounded behavior if option is explicitly specified
            if (opts.isUnbounded !== undefined) {
                ripple.unbounded = opts.isUnbounded;
            }
            return ripple;
        };
        MDCRipple.createAdapter = function (instance) {
            return {
                addClass: function (className) { return instance.root_.classList.add(className); },
                browserSupportsCssVars: function () { return supportsCssVariables(window); },
                computeBoundingRect: function () { return instance.root_.getBoundingClientRect(); },
                containsEventTarget: function (target) { return instance.root_.contains(target); },
                deregisterDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterInteractionHandler: function (evtType, handler) {
                    return instance.root_.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterResizeHandler: function (handler) { return window.removeEventListener('resize', handler); },
                getWindowPageOffset: function () { return ({ x: window.pageXOffset, y: window.pageYOffset }); },
                isSurfaceActive: function () { return matches(instance.root_, ':active'); },
                isSurfaceDisabled: function () { return Boolean(instance.disabled); },
                isUnbounded: function () { return Boolean(instance.unbounded); },
                registerDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.addEventListener(evtType, handler, applyPassive());
                },
                registerInteractionHandler: function (evtType, handler) {
                    return instance.root_.addEventListener(evtType, handler, applyPassive());
                },
                registerResizeHandler: function (handler) { return window.addEventListener('resize', handler); },
                removeClass: function (className) { return instance.root_.classList.remove(className); },
                updateCssVariable: function (varName, value) { return instance.root_.style.setProperty(varName, value); },
            };
        };
        Object.defineProperty(MDCRipple.prototype, "unbounded", {
            get: function () {
                return Boolean(this.unbounded_);
            },
            set: function (unbounded) {
                this.unbounded_ = Boolean(unbounded);
                this.setUnbounded_();
            },
            enumerable: true,
            configurable: true
        });
        MDCRipple.prototype.activate = function () {
            this.foundation_.activate();
        };
        MDCRipple.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        MDCRipple.prototype.layout = function () {
            this.foundation_.layout();
        };
        MDCRipple.prototype.getDefaultFoundation = function () {
            return new MDCRippleFoundation(MDCRipple.createAdapter(this));
        };
        MDCRipple.prototype.initialSyncWithDOM = function () {
            var root = this.root_;
            this.unbounded = 'mdcRippleIsUnbounded' in root.dataset;
        };
        /**
         * Closure Compiler throws an access control error when directly accessing a
         * protected or private property inside a getter/setter, like unbounded above.
         * By accessing the protected property inside a method, we solve that problem.
         * That's why this function exists.
         */
        MDCRipple.prototype.setUnbounded_ = function () {
            this.foundation_.setUnbounded(Boolean(this.unbounded_));
        };
        return MDCRipple;
    }(MDCComponent));

    function Ripple(node, props = {ripple: false, unbounded: false, color: null, classForward: () => {}}) {
      let instance = null;
      let addLayoutListener = getContext('SMUI:addLayoutListener');
      let removeLayoutListener;
      let classList = [];

      function addClass(className) {
        const idx = classList.indexOf(className);
        if (idx === -1) {
          node.classList.add(className);
          classList.push(className);
          if (props.classForward) {
            props.classForward(classList);
          }
        }
      }

      function removeClass(className) {
        const idx = classList.indexOf(className);
        if (idx !== -1) {
          node.classList.remove(className);
          classList.splice(idx, 1);
          if (props.classForward) {
            props.classForward(classList);
          }
        }
      }

      function handleProps() {
        if (props.ripple && !instance) {
          // Override the Ripple component's adapter, so that we can forward classes
          // to Svelte components that overwrite Ripple's classes.
          const _createAdapter = MDCRipple.createAdapter;
          MDCRipple.createAdapter = function(...args) {
            const adapter = _createAdapter.apply(this, args);
            adapter.addClass = function(className) {
              return addClass(className);
            };
            adapter.removeClass = function(className) {
              return removeClass(className);
            };
            return adapter;
          };
          instance = new MDCRipple(node);
          MDCRipple.createAdapter = _createAdapter;
        } else if (instance && !props.ripple) {
          instance.destroy();
          instance = null;
        }
        if (props.ripple) {
          instance.unbounded = !!props.unbounded;
          switch (props.color) {
            case 'surface':
              addClass('mdc-ripple-surface');
              removeClass('mdc-ripple-surface--primary');
              removeClass('mdc-ripple-surface--accent');
              return;
            case 'primary':
              addClass('mdc-ripple-surface');
              addClass('mdc-ripple-surface--primary');
              removeClass('mdc-ripple-surface--accent');
              return;
            case 'secondary':
              addClass('mdc-ripple-surface');
              removeClass('mdc-ripple-surface--primary');
              addClass('mdc-ripple-surface--accent');
              return;
          }
        }
        removeClass('mdc-ripple-surface');
        removeClass('mdc-ripple-surface--primary');
        removeClass('mdc-ripple-surface--accent');
      }

      handleProps();

      if (addLayoutListener) {
        removeLayoutListener = addLayoutListener(layout);
      }

      function layout() {
        if (instance) {
          instance.layout();
        }
      }

      return {
        update(newProps = {ripple: false, unbounded: false, color: null, classForward: []}) {
          props = newProps;
          handleProps();
        },

        destroy() {
          if (instance) {
            instance.destroy();
            instance = null;
            removeClass('mdc-ripple-surface');
            removeClass('mdc-ripple-surface--primary');
            removeClass('mdc-ripple-surface--accent');
          }

          if (removeLayoutListener) {
            removeLayoutListener();
          }
        }
      }
    }

    /* node_modules/@smui/list/Item.svelte generated by Svelte v3.29.0 */
    const file$b = "node_modules/@smui/list/Item.svelte";

    // (40:0) {:else}
    function create_else_block$1(ctx) {
    	let li;
    	let li_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	let li_levels = [
    		{
    			class: li_class_value = "\n      mdc-list-item\n      " + /*className*/ ctx[2] + "\n      " + (/*activated*/ ctx[5] ? "mdc-list-item--activated" : "") + "\n      " + (/*selected*/ ctx[7] ? "mdc-list-item--selected" : "") + "\n      " + (/*disabled*/ ctx[8] ? "mdc-list-item--disabled" : "") + "\n      " + (/*role*/ ctx[6] === "menuitem" && /*selected*/ ctx[7]
    			? "mdc-menu-item--selected"
    			: "") + "\n    "
    		},
    		{ role: /*role*/ ctx[6] },
    		/*role*/ ctx[6] === "option"
    		? {
    				"aria-selected": /*selected*/ ctx[7] ? "true" : "false"
    			}
    		: {},
    		/*role*/ ctx[6] === "radio" || /*role*/ ctx[6] === "checkbox"
    		? {
    				"aria-checked": /*checked*/ ctx[10] ? "true" : "false"
    			}
    		: {},
    		{ tabindex: /*tabindex*/ ctx[0] },
    		/*props*/ ctx[12]
    	];

    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			set_attributes(li, li_data);
    			add_location(li, file$b, 40, 2, 1053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			/*li_binding*/ ctx[23](li);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, li, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[13].call(null, li)),
    					action_destroyer(Ripple_action = Ripple.call(null, li, {
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4]
    					})),
    					listen_dev(li, "click", /*action*/ ctx[15], false, false, false),
    					listen_dev(li, "keydown", /*handleKeydown*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [
    				(!current || dirty & /*className, activated, selected, disabled, role*/ 484 && li_class_value !== (li_class_value = "\n      mdc-list-item\n      " + /*className*/ ctx[2] + "\n      " + (/*activated*/ ctx[5] ? "mdc-list-item--activated" : "") + "\n      " + (/*selected*/ ctx[7] ? "mdc-list-item--selected" : "") + "\n      " + (/*disabled*/ ctx[8] ? "mdc-list-item--disabled" : "") + "\n      " + (/*role*/ ctx[6] === "menuitem" && /*selected*/ ctx[7]
    				? "mdc-menu-item--selected"
    				: "") + "\n    ")) && { class: li_class_value },
    				(!current || dirty & /*role*/ 64) && { role: /*role*/ ctx[6] },
    				dirty & /*role, selected*/ 192 && (/*role*/ ctx[6] === "option"
    				? {
    						"aria-selected": /*selected*/ ctx[7] ? "true" : "false"
    					}
    				: {}),
    				dirty & /*role, checked*/ 1088 && (/*role*/ ctx[6] === "radio" || /*role*/ ctx[6] === "checkbox"
    				? {
    						"aria-checked": /*checked*/ ctx[10] ? "true" : "false"
    					}
    				: {}),
    				(!current || dirty & /*tabindex*/ 1) && { tabindex: /*tabindex*/ ctx[0] },
    				dirty & /*props*/ 4096 && /*props*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, color*/ 24) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3],
    				unbounded: false,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			/*li_binding*/ ctx[23](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(40:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:23) 
    function create_if_block_1$1(ctx) {
    	let span;
    	let span_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	let span_levels = [
    		{
    			class: span_class_value = "\n      mdc-list-item\n      " + /*className*/ ctx[2] + "\n      " + (/*activated*/ ctx[5] ? "mdc-list-item--activated" : "") + "\n      " + (/*selected*/ ctx[7] ? "mdc-list-item--selected" : "") + "\n      " + (/*disabled*/ ctx[8] ? "mdc-list-item--disabled" : "") + "\n    "
    		},
    		/*activated*/ ctx[5] ? { "aria-current": "page" } : {},
    		{ tabindex: /*tabindex*/ ctx[0] },
    		/*props*/ ctx[12]
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$b, 21, 2, 547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[22](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[13].call(null, span)),
    					action_destroyer(Ripple_action = Ripple.call(null, span, {
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4]
    					})),
    					listen_dev(span, "click", /*action*/ ctx[15], false, false, false),
    					listen_dev(span, "keydown", /*handleKeydown*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				(!current || dirty & /*className, activated, selected, disabled*/ 420 && span_class_value !== (span_class_value = "\n      mdc-list-item\n      " + /*className*/ ctx[2] + "\n      " + (/*activated*/ ctx[5] ? "mdc-list-item--activated" : "") + "\n      " + (/*selected*/ ctx[7] ? "mdc-list-item--selected" : "") + "\n      " + (/*disabled*/ ctx[8] ? "mdc-list-item--disabled" : "") + "\n    ")) && { class: span_class_value },
    				dirty & /*activated*/ 32 && (/*activated*/ ctx[5] ? { "aria-current": "page" } : {}),
    				(!current || dirty & /*tabindex*/ 1) && { tabindex: /*tabindex*/ ctx[0] },
    				dirty & /*props*/ 4096 && /*props*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, color*/ 24) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3],
    				unbounded: false,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(21:23) ",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if nav && href}
    function create_if_block$3(ctx) {
    	let a;
    	let a_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	let a_levels = [
    		{
    			class: a_class_value = "\n      mdc-list-item\n      " + /*className*/ ctx[2] + "\n      " + (/*activated*/ ctx[5] ? "mdc-list-item--activated" : "") + "\n      " + (/*selected*/ ctx[7] ? "mdc-list-item--selected" : "") + "\n      " + (/*disabled*/ ctx[8] ? "mdc-list-item--disabled" : "") + "\n    "
    		},
    		{ href: /*href*/ ctx[9] },
    		/*activated*/ ctx[5] ? { "aria-current": "page" } : {},
    		{ tabindex: /*tabindex*/ ctx[0] },
    		/*props*/ ctx[12]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$b, 1, 2, 20);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[21](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, a, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[13].call(null, a)),
    					action_destroyer(Ripple_action = Ripple.call(null, a, {
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4]
    					})),
    					listen_dev(a, "click", /*action*/ ctx[15], false, false, false),
    					listen_dev(a, "keydown", /*handleKeydown*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*className, activated, selected, disabled*/ 420 && a_class_value !== (a_class_value = "\n      mdc-list-item\n      " + /*className*/ ctx[2] + "\n      " + (/*activated*/ ctx[5] ? "mdc-list-item--activated" : "") + "\n      " + (/*selected*/ ctx[7] ? "mdc-list-item--selected" : "") + "\n      " + (/*disabled*/ ctx[8] ? "mdc-list-item--disabled" : "") + "\n    ")) && { class: a_class_value },
    				(!current || dirty & /*href*/ 512) && { href: /*href*/ ctx[9] },
    				dirty & /*activated*/ 32 && (/*activated*/ ctx[5] ? { "aria-current": "page" } : {}),
    				(!current || dirty & /*tabindex*/ 1) && { tabindex: /*tabindex*/ ctx[0] },
    				dirty & /*props*/ 4096 && /*props*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple, color*/ 24) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[3],
    				unbounded: false,
    				color: /*color*/ ctx[4]
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(1:0) {#if nav && href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nav*/ ctx[14] && /*href*/ ctx[9]) return 0;
    		if (/*nav*/ ctx[14] && !/*href*/ ctx[9]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let counter = 0;

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let checked = false;
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { ripple = true } = $$props;
    	let { color = null } = $$props;
    	let { nonInteractive = getContext("SMUI:list:nonInteractive") } = $$props;
    	let { activated = false } = $$props;
    	let { role = getContext("SMUI:list:item:role") } = $$props;
    	let { selected = false } = $$props;
    	let { disabled = false } = $$props;
    	let { tabindex = !nonInteractive && !disabled && (selected || checked) && "0" || "-1" } = $$props;
    	let { href = false } = $$props;
    	let { inputId = "SMUI-form-field-list-" + counter++ } = $$props;
    	let element;
    	let addTabindexIfNoItemsSelectedRaf;
    	let nav = getContext("SMUI:list:item:nav");
    	setContext("SMUI:generic:input:props", { id: inputId });
    	setContext("SMUI:generic:input:setChecked", setChecked);

    	onMount(() => {
    		// Tabindex needs to be '0' if this is the first non-disabled list item, and
    		// no other item is selected.
    		if (!selected && !nonInteractive) {
    			let first = true;
    			let el = element;

    			while (el.previousSibling) {
    				el = el.previousSibling;

    				if (el.nodeType === 1 && el.classList.contains("mdc-list-item") && !el.classList.contains("mdc-list-item--disabled")) {
    					first = false;
    					break;
    				}
    			}

    			if (first) {
    				// This is first, so now set up a check that no other items are
    				// selected.
    				addTabindexIfNoItemsSelectedRaf = window.requestAnimationFrame(addTabindexIfNoItemsSelected);
    			}
    		}
    	});

    	onDestroy(() => {
    		if (addTabindexIfNoItemsSelectedRaf) {
    			window.cancelAnimationFrame(addTabindexIfNoItemsSelectedRaf);
    		}
    	});

    	function addTabindexIfNoItemsSelected() {
    		// Look through next siblings to see if none of them are selected.
    		let noneSelected = true;

    		let el = element;

    		while (el.nextSibling) {
    			el = el.nextSibling;

    			if (el.nodeType === 1 && el.classList.contains("mdc-list-item") && el.attributes["tabindex"] && el.attributes["tabindex"].value === "0") {
    				noneSelected = false;
    				break;
    			}
    		}

    		if (noneSelected) {
    			// This is the first element, and no other element is selected, so the
    			// tabindex should be '0'.
    			$$invalidate(0, tabindex = "0");
    		}
    	}

    	function action(e) {
    		if (disabled) {
    			e.preventDefault();
    		} else {
    			dispatch("SMUI:action", e);
    		}
    	}

    	function handleKeydown(e) {
    		const isEnter = e.key === "Enter" || e.keyCode === 13;
    		const isSpace = e.key === "Space" || e.keyCode === 32;

    		if (isEnter || isSpace) {
    			action(e);
    		}
    	}

    	function setChecked(isChecked) {
    		$$invalidate(10, checked = isChecked);
    		$$invalidate(0, tabindex = !nonInteractive && !disabled && (selected || checked) && "0" || "-1");
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(11, element);
    		});
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(11, element);
    		});
    	}

    	function li_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(11, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(28, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("ripple" in $$new_props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("color" in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ("nonInteractive" in $$new_props) $$invalidate(17, nonInteractive = $$new_props.nonInteractive);
    		if ("activated" in $$new_props) $$invalidate(5, activated = $$new_props.activated);
    		if ("role" in $$new_props) $$invalidate(6, role = $$new_props.role);
    		if ("selected" in $$new_props) $$invalidate(7, selected = $$new_props.selected);
    		if ("disabled" in $$new_props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ("tabindex" in $$new_props) $$invalidate(0, tabindex = $$new_props.tabindex);
    		if ("href" in $$new_props) $$invalidate(9, href = $$new_props.href);
    		if ("inputId" in $$new_props) $$invalidate(18, inputId = $$new_props.inputId);
    		if ("$$scope" in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		counter,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		createEventDispatcher,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		Ripple,
    		dispatch,
    		forwardEvents,
    		checked,
    		use,
    		className,
    		ripple,
    		color,
    		nonInteractive,
    		activated,
    		role,
    		selected,
    		disabled,
    		tabindex,
    		href,
    		inputId,
    		element,
    		addTabindexIfNoItemsSelectedRaf,
    		nav,
    		addTabindexIfNoItemsSelected,
    		action,
    		handleKeydown,
    		setChecked,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(28, $$props = assign(assign({}, $$props), $$new_props));
    		if ("checked" in $$props) $$invalidate(10, checked = $$new_props.checked);
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("ripple" in $$props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ("color" in $$props) $$invalidate(4, color = $$new_props.color);
    		if ("nonInteractive" in $$props) $$invalidate(17, nonInteractive = $$new_props.nonInteractive);
    		if ("activated" in $$props) $$invalidate(5, activated = $$new_props.activated);
    		if ("role" in $$props) $$invalidate(6, role = $$new_props.role);
    		if ("selected" in $$props) $$invalidate(7, selected = $$new_props.selected);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ("tabindex" in $$props) $$invalidate(0, tabindex = $$new_props.tabindex);
    		if ("href" in $$props) $$invalidate(9, href = $$new_props.href);
    		if ("inputId" in $$props) $$invalidate(18, inputId = $$new_props.inputId);
    		if ("element" in $$props) $$invalidate(11, element = $$new_props.element);
    		if ("addTabindexIfNoItemsSelectedRaf" in $$props) addTabindexIfNoItemsSelectedRaf = $$new_props.addTabindexIfNoItemsSelectedRaf;
    		if ("nav" in $$props) $$invalidate(14, nav = $$new_props.nav);
    		if ("props" in $$props) $$invalidate(12, props = $$new_props.props);
    	};

    	let props;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(12, props = exclude($$props, [
    			"use",
    			"class",
    			"ripple",
    			"color",
    			"nonInteractive",
    			"activated",
    			"selected",
    			"disabled",
    			"tabindex",
    			"href",
    			"inputId"
    		]));
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		tabindex,
    		use,
    		className,
    		ripple,
    		color,
    		activated,
    		role,
    		selected,
    		disabled,
    		href,
    		checked,
    		element,
    		props,
    		forwardEvents,
    		nav,
    		action,
    		handleKeydown,
    		nonInteractive,
    		inputId,
    		$$scope,
    		slots,
    		a_binding,
    		span_binding,
    		li_binding
    	];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			use: 1,
    			class: 2,
    			ripple: 3,
    			color: 4,
    			nonInteractive: 17,
    			activated: 5,
    			role: 6,
    			selected: 7,
    			disabled: 8,
    			tabindex: 0,
    			href: 9,
    			inputId: 18
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get use() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activated() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activated(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Text = classAdderBuilder({
      class: 'mdc-list-item__text',
      component: Span,
      contexts: {}
    });

    var PrimaryText = classAdderBuilder({
      class: 'mdc-list-item__primary-text',
      component: Span,
      contexts: {}
    });

    var SecondaryText = classAdderBuilder({
      class: 'mdc-list-item__secondary-text',
      component: Span,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-list-item__meta',
      component: Span,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-list-group',
      component: Div,
      contexts: {}
    });

    /* node_modules/@smui/common/H3.svelte generated by Svelte v3.29.0 */
    const file$c = "node_modules/@smui/common/H3.svelte";

    function create_fragment$f(ctx) {
    	let h3;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let h3_levels = [exclude(/*$$props*/ ctx[2], ["use"])];
    	let h3_data = {};

    	for (let i = 0; i < h3_levels.length; i += 1) {
    		h3_data = assign(h3_data, h3_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if (default_slot) default_slot.c();
    			set_attributes(h3, h3_data);
    			add_location(h3, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);

    			if (default_slot) {
    				default_slot.m(h3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h3, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, h3))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(h3, h3_data = get_spread_update(h3_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use"])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("H3", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class H3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { use: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "H3",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get use() {
    		throw new Error("<H3>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<H3>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    classAdderBuilder({
      class: 'mdc-list-group__subheader',
      component: H3,
      contexts: {}
    });

    /* node_modules/@smui/list/Separator.svelte generated by Svelte v3.29.0 */
    const file$d = "node_modules/@smui/list/Separator.svelte";

    // (13:0) {:else}
    function create_else_block$2(ctx) {
    	let li;
    	let li_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let mounted;
    	let dispose;

    	let li_levels = [
    		{
    			class: li_class_value = "\n      mdc-list-divider\n      " + /*className*/ ctx[1] + "\n      " + (/*padded*/ ctx[4] ? "mdc-list-divider--padded" : "") + "\n      " + (/*inset*/ ctx[5] ? "mdc-list-divider--inset" : "") + "\n    "
    		},
    		{ role: "separator" },
    		/*props*/ ctx[6]
    	];

    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			set_attributes(li, li_data);
    			add_location(li, file$d, 13, 2, 257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, li, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[7].call(null, li))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(li, li_data = get_spread_update(li_levels, [
    				dirty & /*className, padded, inset*/ 50 && li_class_value !== (li_class_value = "\n      mdc-list-divider\n      " + /*className*/ ctx[1] + "\n      " + (/*padded*/ ctx[4] ? "mdc-list-divider--padded" : "") + "\n      " + (/*inset*/ ctx[5] ? "mdc-list-divider--inset" : "") + "\n    ") && { class: li_class_value },
    				{ role: "separator" },
    				dirty & /*props*/ 64 && /*props*/ ctx[6]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(13:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if group || nav}
    function create_if_block$4(ctx) {
    	let hr;
    	let hr_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let mounted;
    	let dispose;

    	let hr_levels = [
    		{
    			class: hr_class_value = "\n      mdc-list-divider\n      " + /*className*/ ctx[1] + "\n      " + (/*padded*/ ctx[4] ? "mdc-list-divider--padded" : "") + "\n      " + (/*inset*/ ctx[5] ? "mdc-list-divider--inset" : "") + "\n    "
    		},
    		/*props*/ ctx[6]
    	];

    	let hr_data = {};

    	for (let i = 0; i < hr_levels.length; i += 1) {
    		hr_data = assign(hr_data, hr_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			set_attributes(hr, hr_data);
    			add_location(hr, file$d, 1, 2, 21);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, hr, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[7].call(null, hr))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(hr, hr_data = get_spread_update(hr_levels, [
    				dirty & /*className, padded, inset*/ 50 && hr_class_value !== (hr_class_value = "\n      mdc-list-divider\n      " + /*className*/ ctx[1] + "\n      " + (/*padded*/ ctx[4] ? "mdc-list-divider--padded" : "") + "\n      " + (/*inset*/ ctx[5] ? "mdc-list-divider--inset" : "") + "\n    ") && { class: hr_class_value },
    				dirty & /*props*/ 64 && /*props*/ ctx[6]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(1:0) {#if group || nav}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*group*/ ctx[2] || /*nav*/ ctx[3]) return create_if_block$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Separator", slots, []);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { group = false } = $$props;
    	let { nav = false } = $$props;
    	let { padded = false } = $$props;
    	let { inset = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("group" in $$new_props) $$invalidate(2, group = $$new_props.group);
    		if ("nav" in $$new_props) $$invalidate(3, nav = $$new_props.nav);
    		if ("padded" in $$new_props) $$invalidate(4, padded = $$new_props.padded);
    		if ("inset" in $$new_props) $$invalidate(5, inset = $$new_props.inset);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		group,
    		nav,
    		padded,
    		inset,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("group" in $$props) $$invalidate(2, group = $$new_props.group);
    		if ("nav" in $$props) $$invalidate(3, nav = $$new_props.nav);
    		if ("padded" in $$props) $$invalidate(4, padded = $$new_props.padded);
    		if ("inset" in $$props) $$invalidate(5, inset = $$new_props.inset);
    		if ("props" in $$props) $$invalidate(6, props = $$new_props.props);
    	};

    	let props;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(6, props = exclude($$props, ["use", "class", "group", "nav", "padded", "inset"]));
    	};

    	$$props = exclude_internal_props($$props);
    	return [use, className, group, nav, padded, inset, props, forwardEvents];
    }

    class Separator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			use: 0,
    			class: 1,
    			group: 2,
    			nav: 3,
    			padded: 4,
    			inset: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Separator",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get use() {
    		throw new Error("<Separator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Separator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Separator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Separator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Separator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Separator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nav() {
    		throw new Error("<Separator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nav(value) {
    		throw new Error("<Separator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padded() {
    		throw new Error("<Separator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padded(value) {
    		throw new Error("<Separator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<Separator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<Separator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/navbar.svelte generated by Svelte v3.29.0 */

    const file$e = "src/components/navbar.svelte";

    // (67:46) <Text>
    function create_default_slot_20(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Scoreboard");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(67:46) <Text>",
    		ctx
    	});

    	return block;
    }

    // (67:6) <Item on:SMUI:action={() => $goto('/')}>
    function create_default_slot_19(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_20] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(67:6) <Item on:SMUI:action={() => $goto('/')}>",
    		ctx
    	});

    	return block;
    }

    // (68:48) <Text>
    function create_default_slot_18(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Tic Tac Toe");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(68:48) <Text>",
    		ctx
    	});

    	return block;
    }

    // (68:6) <Item on:SMUI:action={() => $goto('ttt')}>
    function create_default_slot_17(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_18] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(68:6) <Item on:SMUI:action={() => $goto('ttt')}>",
    		ctx
    	});

    	return block;
    }

    // (69:52) <Text>
    function create_default_slot_16(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hangman");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(69:52) <Text>",
    		ctx
    	});

    	return block;
    }

    // (69:6) <Item on:SMUI:action={() => $goto('hangman')}>
    function create_default_slot_15(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(69:6) <Item on:SMUI:action={() => $goto('hangman')}>",
    		ctx
    	});

    	return block;
    }

    // (70:53) <Text>
    function create_default_slot_14(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Terminal Practice");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(70:53) <Text>",
    		ctx
    	});

    	return block;
    }

    // (70:6) <Item on:SMUI:action={() => $goto('terminal')}>
    function create_default_slot_13(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(70:6) <Item on:SMUI:action={() => $goto('terminal')}>",
    		ctx
    	});

    	return block;
    }

    // (66:4) <List>
    function create_default_slot_12(ctx) {
    	let item0;
    	let t0;
    	let item1;
    	let t1;
    	let item2;
    	let t2;
    	let item3;
    	let current;

    	item0 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_19] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item0.$on("SMUI:action", /*SMUI_action_handler*/ ctx[9]);

    	item1 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_17] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item1.$on("SMUI:action", /*SMUI_action_handler_1*/ ctx[10]);

    	item2 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item2.$on("SMUI:action", /*SMUI_action_handler_2*/ ctx[11]);

    	item3 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item3.$on("SMUI:action", /*SMUI_action_handler_3*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(item0.$$.fragment);
    			t0 = space();
    			create_component(item1.$$.fragment);
    			t1 = space();
    			create_component(item2.$$.fragment);
    			t2 = space();
    			create_component(item3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(item1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(item2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(item3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item0_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item0_changes.$$scope = { dirty, ctx };
    			}

    			item0.$set(item0_changes);
    			const item1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item1_changes.$$scope = { dirty, ctx };
    			}

    			item1.$set(item1_changes);
    			const item2_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item2_changes.$$scope = { dirty, ctx };
    			}

    			item2.$set(item2_changes);
    			const item3_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item3_changes.$$scope = { dirty, ctx };
    			}

    			item3.$set(item3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item0.$$.fragment, local);
    			transition_in(item1.$$.fragment, local);
    			transition_in(item2.$$.fragment, local);
    			transition_in(item3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item0.$$.fragment, local);
    			transition_out(item1.$$.fragment, local);
    			transition_out(item2.$$.fragment, local);
    			transition_out(item3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(item1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(item2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(item3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(66:4) <List>",
    		ctx
    	});

    	return block;
    }

    // (65:2) <Menu bind:this={menu}>
    function create_default_slot_11(ctx) {
    	let list;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(list.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope, $goto*/ 524304) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(65:2) <Menu bind:this={menu}>",
    		ctx
    	});

    	return block;
    }

    // (78:65) <Text>
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("option1");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(78:65) <Text>",
    		ctx
    	});

    	return block;
    }

    // (78:8) <Item on:SMUI:action={() => alert('option is selected')}>
    function create_default_slot_9(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(78:8) <Item on:SMUI:action={() => alert('option is selected')}>",
    		ctx
    	});

    	return block;
    }

    // (79:65) <Text>
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("option2");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(79:65) <Text>",
    		ctx
    	});

    	return block;
    }

    // (79:8) <Item on:SMUI:action={() => alert('option is selected')}>
    function create_default_slot_7(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(79:8) <Item on:SMUI:action={() => alert('option is selected')}>",
    		ctx
    	});

    	return block;
    }

    // (80:65) <Text>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("option3");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(80:65) <Text>",
    		ctx
    	});

    	return block;
    }

    // (80:8) <Item on:SMUI:action={() => alert('option is selected')}>
    function create_default_slot_5(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(80:8) <Item on:SMUI:action={() => alert('option is selected')}>",
    		ctx
    	});

    	return block;
    }

    // (81:65) <Text>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("option4");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(81:65) <Text>",
    		ctx
    	});

    	return block;
    }

    // (81:8) <Item on:SMUI:action={() => alert('option is selected')}>
    function create_default_slot_3(ctx) {
    	let text_1;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(81:8) <Item on:SMUI:action={() => alert('option is selected')}>",
    		ctx
    	});

    	return block;
    }

    // (77:6) <List>
    function create_default_slot_2(ctx) {
    	let item0;
    	let t0;
    	let item1;
    	let t1;
    	let item2;
    	let t2;
    	let item3;
    	let current;

    	item0 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item0.$on("SMUI:action", /*SMUI_action_handler_4*/ ctx[14]);

    	item1 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item1.$on("SMUI:action", /*SMUI_action_handler_5*/ ctx[15]);

    	item2 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item2.$on("SMUI:action", /*SMUI_action_handler_6*/ ctx[16]);

    	item3 = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item3.$on("SMUI:action", /*SMUI_action_handler_7*/ ctx[17]);

    	const block = {
    		c: function create() {
    			create_component(item0.$$.fragment);
    			t0 = space();
    			create_component(item1.$$.fragment);
    			t1 = space();
    			create_component(item2.$$.fragment);
    			t2 = space();
    			create_component(item3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(item1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(item2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(item3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item0_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item0_changes.$$scope = { dirty, ctx };
    			}

    			item0.$set(item0_changes);
    			const item1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item1_changes.$$scope = { dirty, ctx };
    			}

    			item1.$set(item1_changes);
    			const item2_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item2_changes.$$scope = { dirty, ctx };
    			}

    			item2.$set(item2_changes);
    			const item3_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				item3_changes.$$scope = { dirty, ctx };
    			}

    			item3.$set(item3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item0.$$.fragment, local);
    			transition_in(item1.$$.fragment, local);
    			transition_in(item2.$$.fragment, local);
    			transition_in(item3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item0.$$.fragment, local);
    			transition_out(item1.$$.fragment, local);
    			transition_out(item2.$$.fragment, local);
    			transition_out(item3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(item1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(item2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(item3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(77:6) <List>",
    		ctx
    	});

    	return block;
    }

    // (76:4) <Menu bind:this={options}>
    function create_default_slot_1(ctx) {
    	let list;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(list.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(76:4) <Menu bind:this={options}>",
    		ctx
    	});

    	return block;
    }

    // (86:2) {#if playerProfile}
    function create_if_block$5(ctx) {
    	let div;
    	let paper;
    	let current;

    	paper = new Paper({
    			props: {
    				elevation: 4,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(paper.$$.fragment);
    			attr_dev(div, "class", "player-profile svelte-1op73qo");
    			add_location(div, file$e, 86, 2, 3053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(paper, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paper_changes = {};

    			if (dirty & /*$$scope, $players, $count*/ 524328) {
    				paper_changes.$$scope = { dirty, ctx };
    			}

    			paper.$set(paper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(paper);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(86:2) {#if playerProfile}",
    		ctx
    	});

    	return block;
    }

    // (88:4) <Paper elevation={4}>
    function create_default_slot$3(ctx) {
    	let player;
    	let current;

    	const player_spread_levels = [
    		/*$players*/ ctx[3][/*$players*/ ctx[3].length - 1],
    		{ points: /*$count*/ ctx[5] }
    	];

    	let player_props = {};

    	for (let i = 0; i < player_spread_levels.length; i += 1) {
    		player_props = assign(player_props, player_spread_levels[i]);
    	}

    	player = new Player({ props: player_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(player.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(player, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const player_changes = (dirty & /*$players, $count*/ 40)
    			? get_spread_update(player_spread_levels, [
    					dirty & /*$players*/ 8 && get_spread_object(/*$players*/ ctx[3][/*$players*/ ctx[3].length - 1]),
    					dirty & /*$count*/ 32 && { points: /*$count*/ ctx[5] }
    				])
    			: {};

    			player.$set(player_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(player.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(player.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(player, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(88:4) <Paper elevation={4}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div1;
    	let header;
    	let div0;
    	let section0;
    	let button0;
    	let t1;
    	let span;
    	let t2;
    	let t3_value = /*$players*/ ctx[3][/*$players*/ ctx[3].length - 1].name + "";
    	let t3;
    	let t4;
    	let t5;
    	let section1;
    	let button1;
    	let img;
    	let img_src_value;
    	let t6;
    	let button2;
    	let t8;
    	let button3;
    	let t10;
    	let div2;
    	let menu0;
    	let t11;
    	let div3;
    	let menu1;
    	let t12;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	let menu0_props = {
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	};

    	menu0 = new Menu({ props: menu0_props, $$inline: true });
    	/*menu0_binding*/ ctx[13](menu0);

    	let menu1_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	menu1 = new Menu({ props: menu1_props, $$inline: true });
    	/*menu1_binding*/ ctx[18](menu1);
    	let if_block = /*playerProfile*/ ctx[2] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			div0 = element("div");
    			section0 = element("section");
    			button0 = element("button");
    			button0.textContent = "menu";
    			t1 = space();
    			span = element("span");
    			t2 = text("Hello ");
    			t3 = text(t3_value);
    			t4 = text(", Welcome to Unified Arcade App");
    			t5 = space();
    			section1 = element("section");
    			button1 = element("button");
    			img = element("img");
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "search";
    			t8 = space();
    			button3 = element("button");
    			button3.textContent = "more_vert";
    			t10 = space();
    			div2 = element("div");
    			create_component(menu0.$$.fragment);
    			t11 = space();
    			div3 = element("div");
    			create_component(menu1.$$.fragment);
    			t12 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(button0, "class", "material-icons mdc-top-app-bar__navigation-icon mdc-icon-button");
    			attr_dev(button0, "aria-label", "Open navigation menu");
    			add_location(button0, file$e, 50, 12, 1084);
    			attr_dev(span, "class", "mdc-top-app-bar__title");
    			add_location(span, file$e, 51, 12, 1260);
    			attr_dev(section0, "class", "mdc-top-app-bar__section mdc-top-app-bar__section--align-start");
    			add_location(section0, file$e, 49, 10, 991);
    			if (img.src !== (img_src_value = /*$players*/ ctx[3][/*$players*/ ctx[3].length - 1].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "portrait");
    			attr_dev(img, "class", "svelte-1op73qo");
    			add_location(img, file$e, 54, 158, 1659);
    			attr_dev(button1, "class", "material-icons mdc-top-app-bar__action-item mdc-icon-button");
    			attr_dev(button1, "aria-label", "portrait");
    			add_location(button1, file$e, 54, 12, 1513);
    			attr_dev(button2, "class", "material-icons mdc-top-app-bar__action-item mdc-icon-button");
    			attr_dev(button2, "aria-label", "Search");
    			add_location(button2, file$e, 55, 12, 1744);
    			attr_dev(button3, "class", "material-icons mdc-top-app-bar__action-item mdc-icon-button");
    			attr_dev(button3, "aria-label", "Options");
    			add_location(button3, file$e, 56, 12, 1868);
    			attr_dev(section1, "class", "mdc-top-app-bar__section mdc-top-app-bar__section--align-end");
    			attr_dev(section1, "role", "toolbar");
    			add_location(section1, file$e, 53, 10, 1407);
    			attr_dev(div0, "class", "mdc-top-app-bar__row");
    			add_location(div0, file$e, 48, 8, 946);
    			attr_dev(header, "class", "mdc-top-app-bar");
    			add_location(header, file$e, 47, 4, 905);
    			attr_dev(div1, "class", "appBar");
    			add_location(div1, file$e, 46, 0, 880);
    			attr_dev(div2, "class", "navMenu svelte-1op73qo");
    			set_style(div2, "min-width", "100px");
    			add_location(div2, file$e, 63, 0, 2084);
    			attr_dev(div3, "class", "optionMenu svelte-1op73qo");
    			set_style(div3, "min-width", "50px");
    			add_location(div3, file$e, 74, 0, 2527);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, div0);
    			append_dev(div0, section0);
    			append_dev(section0, button0);
    			append_dev(section0, t1);
    			append_dev(section0, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    			append_dev(span, t4);
    			append_dev(div0, t5);
    			append_dev(div0, section1);
    			append_dev(section1, button1);
    			append_dev(button1, img);
    			append_dev(section1, t6);
    			append_dev(section1, button2);
    			append_dev(section1, t8);
    			append_dev(section1, button3);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(menu0, div2, null);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(menu1, div3, null);
    			insert_dev(target, t12, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", /*click_handler_2*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$players*/ 8) && t3_value !== (t3_value = /*$players*/ ctx[3][/*$players*/ ctx[3].length - 1].name + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*$players*/ 8 && img.src !== (img_src_value = /*$players*/ ctx[3][/*$players*/ ctx[3].length - 1].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			const menu0_changes = {};

    			if (dirty & /*$$scope, $goto*/ 524304) {
    				menu0_changes.$$scope = { dirty, ctx };
    			}

    			menu0.$set(menu0_changes);
    			const menu1_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				menu1_changes.$$scope = { dirty, ctx };
    			}

    			menu1.$set(menu1_changes);

    			if (/*playerProfile*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*playerProfile*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu0.$$.fragment, local);
    			transition_in(menu1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu0.$$.fragment, local);
    			transition_out(menu1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div2);
    			/*menu0_binding*/ ctx[13](null);
    			destroy_component(menu0);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div3);
    			/*menu1_binding*/ ctx[18](null);
    			destroy_component(menu1);
    			if (detaching) detach_dev(t12);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $players;
    	let $goto;
    	let $count;
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(3, $players = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(4, $goto = $$value));
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(5, $count = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	let menu;
    	let options;
    	let playerProfile = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => menu.setOpen(true);
    	const click_handler_1 = () => $$invalidate(2, playerProfile = !playerProfile);
    	const click_handler_2 = () => options.setOpen(true);
    	const SMUI_action_handler = () => $goto("/");
    	const SMUI_action_handler_1 = () => $goto("ttt");
    	const SMUI_action_handler_2 = () => $goto("hangman");
    	const SMUI_action_handler_3 = () => $goto("terminal");

    	function menu0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			menu = $$value;
    			$$invalidate(0, menu);
    		});
    	}

    	const SMUI_action_handler_4 = () => alert("option is selected");
    	const SMUI_action_handler_5 = () => alert("option is selected");
    	const SMUI_action_handler_6 = () => alert("option is selected");
    	const SMUI_action_handler_7 = () => alert("option is selected");

    	function menu1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			options = $$value;
    			$$invalidate(1, options);
    		});
    	}

    	$$self.$capture_state = () => ({
    		players,
    		count,
    		Player,
    		Paper,
    		goto,
    		Menu,
    		List,
    		Item,
    		Separator,
    		Text,
    		PrimaryText,
    		SecondaryText,
    		Graphic,
    		menu,
    		options,
    		playerProfile,
    		$players,
    		$goto,
    		$count
    	});

    	$$self.$inject_state = $$props => {
    		if ("menu" in $$props) $$invalidate(0, menu = $$props.menu);
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    		if ("playerProfile" in $$props) $$invalidate(2, playerProfile = $$props.playerProfile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		menu,
    		options,
    		playerProfile,
    		$players,
    		$goto,
    		$count,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		SMUI_action_handler,
    		SMUI_action_handler_1,
    		SMUI_action_handler_2,
    		SMUI_action_handler_3,
    		menu0_binding,
    		SMUI_action_handler_4,
    		SMUI_action_handler_5,
    		SMUI_action_handler_6,
    		SMUI_action_handler_7,
    		menu1_binding
    	];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/pages/_layout.svelte generated by Svelte v3.29.0 */
    const file$f = "src/pages/_layout.svelte";

    function create_fragment$i(ctx) {
    	let navbar;
    	let t;
    	let div;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "container svelte-1nqwwst");
    			add_location(div, file$f, 5, 0, 87);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layout", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Navbar });
    	return [$$scope, slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/pages/experimental.svelte generated by Svelte v3.29.0 */
    const file$g = "src/pages/experimental.svelte";

    function create_fragment$j(ctx) {
    	let div1;
    	let div0;
    	let ul;
    	let li0;
    	let span0;
    	let t0;
    	let span1;
    	let p0;
    	let a0;
    	let t2;
    	let li1;
    	let span2;
    	let t3;
    	let span3;
    	let p1;
    	let a1;
    	let t5;
    	let li2;
    	let span4;
    	let t6;
    	let span5;
    	let p2;
    	let a2;
    	let t8;
    	let li3;
    	let span6;
    	let t9;
    	let span7;
    	let p3;
    	let a3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "Scoreboard";
    			t2 = space();
    			li1 = element("li");
    			span2 = element("span");
    			t3 = space();
    			span3 = element("span");
    			p1 = element("p");
    			a1 = element("a");
    			a1.textContent = "Tic Tac Toe";
    			t5 = space();
    			li2 = element("li");
    			span4 = element("span");
    			t6 = space();
    			span5 = element("span");
    			p2 = element("p");
    			a2 = element("a");
    			a2.textContent = "Hangman";
    			t8 = space();
    			li3 = element("li");
    			span6 = element("span");
    			t9 = space();
    			span7 = element("span");
    			p3 = element("p");
    			a3 = element("a");
    			a3.textContent = "Terminal Practice";
    			attr_dev(span0, "class", "mdc-list-item__ripple");
    			add_location(span0, file$g, 8, 14, 298);
    			attr_dev(a0, "href", "./");
    			add_location(a0, file$g, 9, 51, 393);
    			add_location(p0, file$g, 9, 48, 390);
    			attr_dev(span1, "class", "mdc-list-item__text");
    			add_location(span1, file$g, 9, 14, 356);
    			attr_dev(li0, "class", "mdc-list-item");
    			attr_dev(li0, "role", "menuitem");
    			add_location(li0, file$g, 7, 10, 241);
    			attr_dev(span2, "class", "mdc-list-item__ripple");
    			add_location(span2, file$g, 12, 14, 515);
    			attr_dev(a1, "href", "./ttt");
    			add_location(a1, file$g, 13, 51, 610);
    			add_location(p1, file$g, 13, 48, 607);
    			attr_dev(span3, "class", "mdc-list-item__text");
    			add_location(span3, file$g, 13, 14, 573);
    			attr_dev(li1, "class", "mdc-list-item");
    			attr_dev(li1, "role", "menuitem");
    			add_location(li1, file$g, 11, 10, 458);
    			attr_dev(span4, "class", "mdc-list-item__ripple");
    			add_location(span4, file$g, 16, 14, 736);
    			attr_dev(a2, "href", "./hangman");
    			add_location(a2, file$g, 17, 51, 831);
    			add_location(p2, file$g, 17, 48, 828);
    			attr_dev(span5, "class", "mdc-list-item__text");
    			add_location(span5, file$g, 17, 14, 794);
    			attr_dev(li2, "class", "mdc-list-item");
    			attr_dev(li2, "role", "menuitem");
    			add_location(li2, file$g, 15, 10, 679);
    			attr_dev(span6, "class", "mdc-list-item__ripple");
    			add_location(span6, file$g, 20, 14, 957);
    			attr_dev(a3, "href", "./terminal");
    			add_location(a3, file$g, 21, 51, 1052);
    			add_location(p3, file$g, 21, 48, 1049);
    			attr_dev(span7, "class", "mdc-list-item__text");
    			add_location(span7, file$g, 21, 14, 1015);
    			attr_dev(li3, "class", "mdc-list-item");
    			attr_dev(li3, "role", "menuitem");
    			add_location(li3, file$g, 19, 10, 900);
    			attr_dev(ul, "class", "mdc-list");
    			attr_dev(ul, "role", "menu");
    			attr_dev(ul, "aria-hidden", "true");
    			attr_dev(ul, "aria-orientation", "vertical");
    			attr_dev(ul, "tabindex", "-1");
    			add_location(ul, file$g, 6, 6, 136);
    			attr_dev(div0, "class", "mdc-menu mdc-menu-surface");
    			add_location(div0, file$g, 5, 2, 90);
    			attr_dev(div1, "class", "navMenu");
    			add_location(div1, file$g, 4, 0, 66);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, span0);
    			append_dev(li0, t0);
    			append_dev(li0, span1);
    			append_dev(span1, p0);
    			append_dev(p0, a0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, span2);
    			append_dev(li1, t3);
    			append_dev(li1, span3);
    			append_dev(span3, p1);
    			append_dev(p1, a1);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, span4);
    			append_dev(li2, t6);
    			append_dev(li2, span5);
    			append_dev(span5, p2);
    			append_dev(p2, a2);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, span6);
    			append_dev(li3, t9);
    			append_dev(li3, span7);
    			append_dev(span7, p3);
    			append_dev(p3, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Experimental", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Experimental> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ goto });
    	return [];
    }

    class Experimental extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Experimental",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* node_modules/@smui/common/A.svelte generated by Svelte v3.29.0 */
    const file$h = "node_modules/@smui/common/A.svelte";

    function create_fragment$k(ctx) {
    	let a;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let a_levels = [{ href: /*href*/ ctx[1] }, exclude(/*$$props*/ ctx[3], ["use", "href"])];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, a, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[2].call(null, a))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
    				dirty & /*$$props*/ 8 && exclude(/*$$props*/ ctx[3], ["use", "href"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("A", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { href = "javascript:void(0);" } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("href" in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		href
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("href" in $$props) $$invalidate(1, href = $$new_props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, href, forwardEvents, $$props, $$scope, slots];
    }

    class A extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { use: 0, href: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "A",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get use() {
    		throw new Error("<A>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<A>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Button.svelte generated by Svelte v3.29.0 */
    const file$i = "node_modules/@smui/common/Button.svelte";

    function create_fragment$l(ctx) {
    	let button;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let button_levels = [exclude(/*$$props*/ ctx[2], ["use"])];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$i, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, button, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[1].call(null, button))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use"])]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, forwardEvents, $$props, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { use: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/button/Button.svelte generated by Svelte v3.29.0 */

    // (1:0) <svelte:component   this={component}   use={[[Ripple, {ripple, unbounded: false, classForward: classes => rippleClasses = classes}], forwardEvents, ...use]}   class="     mdc-button     {className}     {rippleClasses.join(' ')}     {variant === 'raised' ? 'mdc-button--raised' : ''}     {variant === 'unelevated' ? 'mdc-button--unelevated' : ''}     {variant === 'outlined' ? 'mdc-button--outlined' : ''}     {dense ? 'mdc-button--dense' : ''}     {color === 'secondary' ? 'smui-button--color-secondary' : ''}     {context === 'card:action' ? 'mdc-card__action' : ''}     {context === 'card:action' ? 'mdc-card__action--button' : ''}     {context === 'dialog:action' ? 'mdc-dialog__button' : ''}     {context === 'top-app-bar:navigation' ? 'mdc-top-app-bar__navigation-icon' : ''}     {context === 'top-app-bar:action' ? 'mdc-top-app-bar__action-item' : ''}     {context === 'snackbar' ? 'mdc-snackbar__action' : ''}   "   {...actionProp}   {...defaultProp}   {...exclude($$props, ['use', 'class', 'ripple', 'color', 'variant', 'dense', ...dialogExcludes])} >
    function create_default_slot$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   use={[[Ripple, {ripple, unbounded: false, classForward: classes => rippleClasses = classes}], forwardEvents, ...use]}   class=\\\"     mdc-button     {className}     {rippleClasses.join(' ')}     {variant === 'raised' ? 'mdc-button--raised' : ''}     {variant === 'unelevated' ? 'mdc-button--unelevated' : ''}     {variant === 'outlined' ? 'mdc-button--outlined' : ''}     {dense ? 'mdc-button--dense' : ''}     {color === 'secondary' ? 'smui-button--color-secondary' : ''}     {context === 'card:action' ? 'mdc-card__action' : ''}     {context === 'card:action' ? 'mdc-card__action--button' : ''}     {context === 'dialog:action' ? 'mdc-dialog__button' : ''}     {context === 'top-app-bar:navigation' ? 'mdc-top-app-bar__navigation-icon' : ''}     {context === 'top-app-bar:action' ? 'mdc-top-app-bar__action-item' : ''}     {context === 'snackbar' ? 'mdc-snackbar__action' : ''}   \\\"   {...actionProp}   {...defaultProp}   {...exclude($$props, ['use', 'class', 'ripple', 'color', 'variant', 'dense', ...dialogExcludes])} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [
    				[
    					Ripple,
    					{
    						ripple: /*ripple*/ ctx[2],
    						unbounded: false,
    						classForward: /*func*/ ctx[18]
    					}
    				],
    				/*forwardEvents*/ ctx[11],
    				.../*use*/ ctx[0]
    			]
    		},
    		{
    			class: "\n    mdc-button\n    " + /*className*/ ctx[1] + "\n    " + /*rippleClasses*/ ctx[7].join(" ") + "\n    " + (/*variant*/ ctx[4] === "raised"
    			? "mdc-button--raised"
    			: "") + "\n    " + (/*variant*/ ctx[4] === "unelevated"
    			? "mdc-button--unelevated"
    			: "") + "\n    " + (/*variant*/ ctx[4] === "outlined"
    			? "mdc-button--outlined"
    			: "") + "\n    " + (/*dense*/ ctx[5] ? "mdc-button--dense" : "") + "\n    " + (/*color*/ ctx[3] === "secondary"
    			? "smui-button--color-secondary"
    			: "") + "\n    " + (/*context*/ ctx[12] === "card:action"
    			? "mdc-card__action"
    			: "") + "\n    " + (/*context*/ ctx[12] === "card:action"
    			? "mdc-card__action--button"
    			: "") + "\n    " + (/*context*/ ctx[12] === "dialog:action"
    			? "mdc-dialog__button"
    			: "") + "\n    " + (/*context*/ ctx[12] === "top-app-bar:navigation"
    			? "mdc-top-app-bar__navigation-icon"
    			: "") + "\n    " + (/*context*/ ctx[12] === "top-app-bar:action"
    			? "mdc-top-app-bar__action-item"
    			: "") + "\n    " + (/*context*/ ctx[12] === "snackbar"
    			? "mdc-snackbar__action"
    			: "") + "\n  "
    		},
    		/*actionProp*/ ctx[9],
    		/*defaultProp*/ ctx[10],
    		exclude(/*$$props*/ ctx[13], [
    			"use",
    			"class",
    			"ripple",
    			"color",
    			"variant",
    			"dense",
    			.../*dialogExcludes*/ ctx[8]
    		])
    	];

    	var switch_value = /*component*/ ctx[6];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$4] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*Ripple, ripple, rippleClasses, forwardEvents, use, className, variant, dense, color, context, actionProp, defaultProp, exclude, $$props, dialogExcludes*/ 16319)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*Ripple, ripple, rippleClasses, forwardEvents, use*/ 2181 && {
    						use: [
    							[
    								Ripple,
    								{
    									ripple: /*ripple*/ ctx[2],
    									unbounded: false,
    									classForward: /*func*/ ctx[18]
    								}
    							],
    							/*forwardEvents*/ ctx[11],
    							.../*use*/ ctx[0]
    						]
    					},
    					dirty & /*className, rippleClasses, variant, dense, color, context*/ 4282 && {
    						class: "\n    mdc-button\n    " + /*className*/ ctx[1] + "\n    " + /*rippleClasses*/ ctx[7].join(" ") + "\n    " + (/*variant*/ ctx[4] === "raised"
    						? "mdc-button--raised"
    						: "") + "\n    " + (/*variant*/ ctx[4] === "unelevated"
    						? "mdc-button--unelevated"
    						: "") + "\n    " + (/*variant*/ ctx[4] === "outlined"
    						? "mdc-button--outlined"
    						: "") + "\n    " + (/*dense*/ ctx[5] ? "mdc-button--dense" : "") + "\n    " + (/*color*/ ctx[3] === "secondary"
    						? "smui-button--color-secondary"
    						: "") + "\n    " + (/*context*/ ctx[12] === "card:action"
    						? "mdc-card__action"
    						: "") + "\n    " + (/*context*/ ctx[12] === "card:action"
    						? "mdc-card__action--button"
    						: "") + "\n    " + (/*context*/ ctx[12] === "dialog:action"
    						? "mdc-dialog__button"
    						: "") + "\n    " + (/*context*/ ctx[12] === "top-app-bar:navigation"
    						? "mdc-top-app-bar__navigation-icon"
    						: "") + "\n    " + (/*context*/ ctx[12] === "top-app-bar:action"
    						? "mdc-top-app-bar__action-item"
    						: "") + "\n    " + (/*context*/ ctx[12] === "snackbar"
    						? "mdc-snackbar__action"
    						: "") + "\n  "
    					},
    					dirty & /*actionProp*/ 512 && get_spread_object(/*actionProp*/ ctx[9]),
    					dirty & /*defaultProp*/ 1024 && get_spread_object(/*defaultProp*/ ctx[10]),
    					dirty & /*exclude, $$props, dialogExcludes*/ 8448 && get_spread_object(exclude(/*$$props*/ ctx[13], [
    						"use",
    						"class",
    						"ripple",
    						"color",
    						"variant",
    						"dense",
    						.../*dialogExcludes*/ ctx[8]
    					]))
    				])
    			: {};

    			if (dirty & /*$$scope*/ 524288) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[6])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { ripple = true } = $$props;
    	let { color = "primary" } = $$props;
    	let { variant = "text" } = $$props;
    	let { dense = false } = $$props;
    	let { href = null } = $$props;
    	let { action = "close" } = $$props;
    	let { default: defaultAction = false } = $$props;
    	let { component = href == null ? Button : A } = $$props;
    	let context = getContext("SMUI:button:context");
    	let rippleClasses = [];
    	setContext("SMUI:label:context", "button");
    	setContext("SMUI:icon:context", "button");
    	const func = classes => $$invalidate(7, rippleClasses = classes);

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("ripple" in $$new_props) $$invalidate(2, ripple = $$new_props.ripple);
    		if ("color" in $$new_props) $$invalidate(3, color = $$new_props.color);
    		if ("variant" in $$new_props) $$invalidate(4, variant = $$new_props.variant);
    		if ("dense" in $$new_props) $$invalidate(5, dense = $$new_props.dense);
    		if ("href" in $$new_props) $$invalidate(14, href = $$new_props.href);
    		if ("action" in $$new_props) $$invalidate(15, action = $$new_props.action);
    		if ("default" in $$new_props) $$invalidate(16, defaultAction = $$new_props.default);
    		if ("component" in $$new_props) $$invalidate(6, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(19, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		A,
    		Button,
    		Ripple,
    		forwardEvents,
    		use,
    		className,
    		ripple,
    		color,
    		variant,
    		dense,
    		href,
    		action,
    		defaultAction,
    		component,
    		context,
    		rippleClasses,
    		dialogExcludes,
    		actionProp,
    		defaultProp
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("ripple" in $$props) $$invalidate(2, ripple = $$new_props.ripple);
    		if ("color" in $$props) $$invalidate(3, color = $$new_props.color);
    		if ("variant" in $$props) $$invalidate(4, variant = $$new_props.variant);
    		if ("dense" in $$props) $$invalidate(5, dense = $$new_props.dense);
    		if ("href" in $$props) $$invalidate(14, href = $$new_props.href);
    		if ("action" in $$props) $$invalidate(15, action = $$new_props.action);
    		if ("defaultAction" in $$props) $$invalidate(16, defaultAction = $$new_props.defaultAction);
    		if ("component" in $$props) $$invalidate(6, component = $$new_props.component);
    		if ("context" in $$props) $$invalidate(12, context = $$new_props.context);
    		if ("rippleClasses" in $$props) $$invalidate(7, rippleClasses = $$new_props.rippleClasses);
    		if ("dialogExcludes" in $$props) $$invalidate(8, dialogExcludes = $$new_props.dialogExcludes);
    		if ("actionProp" in $$props) $$invalidate(9, actionProp = $$new_props.actionProp);
    		if ("defaultProp" in $$props) $$invalidate(10, defaultProp = $$new_props.defaultProp);
    	};

    	let dialogExcludes;
    	let actionProp;
    	let defaultProp;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*action*/ 32768) {
    			 $$invalidate(9, actionProp = context === "dialog:action" && action !== null
    			? { "data-mdc-dialog-action": action }
    			: {});
    		}

    		if ($$self.$$.dirty & /*defaultAction*/ 65536) {
    			 $$invalidate(10, defaultProp = context === "dialog:action" && defaultAction
    			? { "data-mdc-dialog-button-default": "" }
    			: {});
    		}
    	};

    	 $$invalidate(8, dialogExcludes = context === "dialog:action" ? ["action", "default"] : []);
    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		ripple,
    		color,
    		variant,
    		dense,
    		component,
    		rippleClasses,
    		dialogExcludes,
    		actionProp,
    		defaultProp,
    		forwardEvents,
    		context,
    		$$props,
    		href,
    		action,
    		defaultAction,
    		slots,
    		func,
    		$$scope
    	];
    }

    class Button_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			use: 0,
    			class: 1,
    			ripple: 2,
    			color: 3,
    			variant: 4,
    			dense: 5,
    			href: 14,
    			action: 15,
    			default: 16,
    			component: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button_1",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get default() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set default(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/gitLookup.svelte generated by Svelte v3.29.0 */

    const { console: console_1 } = globals;
    const file$j = "src/pages/gitLookup.svelte";

    // (27:1) <Button on:click={myFunction} variation="raised">
    function create_default_slot$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Click me");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(27:1) <Button on:click={myFunction} variation=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let body;
    	let p;
    	let t1;
    	let input_1;
    	let t2;
    	let button;
    	let t3;
    	let div;
    	let t4;
    	let t5;
    	let img;
    	let img_src_value;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button_1({
    			props: {
    				variation: "raised",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*myFunction*/ ctx[3]);

    	const block = {
    		c: function create() {
    			body = element("body");
    			p = element("p");
    			p.textContent = "type username to look up on github";
    			t1 = text("\n\tType here: ");
    			input_1 = element("input");
    			t2 = space();
    			create_component(button.$$.fragment);
    			t3 = text("\n\tresult: ");
    			div = element("div");
    			t4 = text(/*output*/ ctx[2]);
    			t5 = space();
    			img = element("img");
    			add_location(p, file$j, 24, 1, 633);
    			attr_dev(input_1, "placeholder", "username");
    			add_location(input_1, file$j, 25, 12, 687);
    			add_location(div, file$j, 27, 9, 814);
    			if (img.src !== (img_src_value = /*picture*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "a bio");
    			add_location(img, file$j, 28, 1, 835);
    			add_location(body, file$j, 23, 0, 625);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, p);
    			append_dev(body, t1);
    			append_dev(body, input_1);
    			set_input_value(input_1, /*input*/ ctx[1]);
    			append_dev(body, t2);
    			mount_component(button, body, null);
    			append_dev(body, t3);
    			append_dev(body, div);
    			append_dev(div, t4);
    			append_dev(body, t5);
    			append_dev(body, img);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*input*/ 2 && input_1.value !== /*input*/ ctx[1]) {
    				set_input_value(input_1, /*input*/ ctx[1]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 64) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			if (!current || dirty & /*output*/ 4) set_data_dev(t4, /*output*/ ctx[2]);

    			if (!current || dirty & /*picture*/ 1 && img.src !== (img_src_value = /*picture*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $players;
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(5, $players = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GitLookup", slots, []);
    	let picture;
    	let input;
    	let output = "enter username first";

    	async function myFunction() {
    		let url = "https://api.github.com/users/" + input;

    		try {
    			const response = await fetch(url);
    			console.log(response);
    			const data = await response.json();
    			$$invalidate(2, output = `login: ${data.login}, bio: ${data.bio}, repos url: ${data.repos_url}`);
    			$$invalidate(0, picture = data.avatar_url);
    			set_store_value(players, $players[players.length].name = input, $players);
    			console.log(data);
    		} catch(error) {
    			console.error(error);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<GitLookup> was created with unknown prop '${key}'`);
    	});

    	function input_1_input_handler() {
    		input = this.value;
    		$$invalidate(1, input);
    	}

    	$$self.$capture_state = () => ({
    		count,
    		players,
    		Button: Button_1,
    		picture,
    		input,
    		output,
    		myFunction,
    		$players
    	});

    	$$self.$inject_state = $$props => {
    		if ("picture" in $$props) $$invalidate(0, picture = $$props.picture);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("output" in $$props) $$invalidate(2, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [picture, input, output, myFunction, input_1_input_handler];
    }

    class GitLookup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GitLookup",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function elasticOut(t) {
        return (Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0);
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/components/APIinputs.svelte generated by Svelte v3.29.0 */

    const { console: console_1$1 } = globals;
    const file$k = "src/components/APIinputs.svelte";

    // (21:0) {#if text}
    function create_if_block$6(ctx) {
    	let h3;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text("Your wordlist will be based on ");
    			t1 = text(/*text*/ ctx[0]);
    			add_location(h3, file$k, 21, 0, 672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data_dev(t1, /*text*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(21:0) {#if text}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let form;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*text*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter a topic");
    			add_location(input0, file$k, 17, 4, 521);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Generate wordlist";
    			attr_dev(input1, "class", "btn");
    			add_location(input1, file$k, 18, 4, 591);
    			add_location(form, file$k, 16, 0, 474);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);
    			set_input_value(input0, /*text*/ ctx[0]);
    			append_dev(form, t0);
    			append_dev(form, input1);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(form, "submit", prevent_default(/*onSubmit*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1 && input0.value !== /*text*/ ctx[0]) {
    				set_input_value(input0, /*text*/ ctx[0]);
    			}

    			if (/*text*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("APIinputs", slots, []);
    	const dispatch = createEventDispatcher();
    	let text = "";

    	async function onSubmit(e) {
    		let url = `https://api.datamuse.com/words?ml=${text}&max=10`;

    		try {
    			const response = await fetch(url);
    			const data = await response.json();
    			dispatch("getlist", data);
    		} catch(error) {
    			console.error(error);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<APIinputs> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		text,
    		onSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, onSubmit, input0_input_handler];
    }

    class APIinputs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "APIinputs",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* node_modules/@smui/card/Card.svelte generated by Svelte v3.29.0 */
    const file$l = "node_modules/@smui/card/Card.svelte";

    function create_fragment$p(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	let div_levels = [
    		{
    			class: div_class_value = "\n    mdc-card\n    " + /*className*/ ctx[1] + "\n    " + (/*variant*/ ctx[2] === "outlined"
    			? "mdc-card--outlined"
    			: "") + "\n    " + (/*padded*/ ctx[3] ? "smui-card--padded" : "") + "\n  "
    		},
    		exclude(/*$$props*/ ctx[5], ["use", "class", "variant", "padded"])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$l, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[4].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, variant, padded*/ 14 && div_class_value !== (div_class_value = "\n    mdc-card\n    " + /*className*/ ctx[1] + "\n    " + (/*variant*/ ctx[2] === "outlined"
    				? "mdc-card--outlined"
    				: "") + "\n    " + (/*padded*/ ctx[3] ? "smui-card--padded" : "") + "\n  ")) && { class: div_class_value },
    				dirty & /*$$props*/ 32 && exclude(/*$$props*/ ctx[5], ["use", "class", "variant", "padded"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Card", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { variant = "raised" } = $$props;
    	let { padded = false } = $$props;

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("variant" in $$new_props) $$invalidate(2, variant = $$new_props.variant);
    		if ("padded" in $$new_props) $$invalidate(3, padded = $$new_props.padded);
    		if ("$$scope" in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		variant,
    		padded
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("variant" in $$props) $$invalidate(2, variant = $$new_props.variant);
    		if ("padded" in $$props) $$invalidate(3, padded = $$new_props.padded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [use, className, variant, padded, forwardEvents, $$props, $$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { use: 0, class: 1, variant: 2, padded: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get use() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padded() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padded(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    classAdderBuilder({
      class: 'smui-card__content',
      component: Div,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-card__media-content',
      component: Div,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-card__action-buttons',
      component: Div,
      contexts: {}
    });

    classAdderBuilder({
      class: 'mdc-card__action-icons',
      component: Div,
      contexts: {}
    });

    /* src/pages/hangman.svelte generated by Svelte v3.29.0 */

    const { console: console_1$2 } = globals;
    const file$m = "src/pages/hangman.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (75:12) {#if toggle}
    function create_if_block_6(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "The wordlist is ready.";
    			attr_dev(p, "class", "svelte-epmkex");
    			add_location(p, file$m, 75, 12, 2600);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(75:12) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    // (88:39) 
    function create_if_block_5(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*gameOver*/ ctx[8]);
    			add_location(h2, file$m, 88, 20, 3264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameOver*/ 256) set_data_dev(t, /*gameOver*/ ctx[8]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(88:39) ",
    		ctx
    	});

    	return block;
    }

    // (81:20) {#if !won && chances > 0}
    function create_if_block_4(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let span;
    	let t5;
    	let input;
    	let t6;
    	let div;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button_1({
    			props: {
    				variant: "raised",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text("You have ");
    			t1 = text(/*chances*/ ctx[7]);
    			t2 = text(" guesses.");
    			t3 = space();
    			span = element("span");
    			span.textContent = "Your guess:";
    			t5 = space();
    			input = element("input");
    			t6 = space();
    			div = element("div");
    			create_component(button.$$.fragment);
    			add_location(h3, file$m, 81, 20, 2803);
    			attr_dev(span, "class", "svelte-epmkex");
    			add_location(span, file$m, 82, 20, 2860);
    			attr_dev(input, "class", "svelte-epmkex");
    			add_location(input, file$m, 83, 20, 2905);
    			attr_dev(div, "class", "btn-container svelte-epmkex");
    			add_location(div, file$m, 84, 20, 3037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*text*/ ctx[2]);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[12]),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*chances*/ 128) set_data_dev(t1, /*chances*/ ctx[7]);

    			if (dirty & /*text*/ 4 && input.value !== /*text*/ ctx[2]) {
    				set_input_value(input, /*text*/ ctx[2]);
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 268435456) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(81:20) {#if !won && chances > 0}",
    		ctx
    	});

    	return block;
    }

    // (86:24) <Button variant="raised" on:click={() => checkGuess(text.toLowerCase())}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Guess");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(86:24) <Button variant=\\\"raised\\\" on:click={() => checkGuess(text.toLowerCase())}>",
    		ctx
    	});

    	return block;
    }

    // (99:39) 
    function create_if_block_3$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "'Sorry, you guessed wrong.'";
    			attr_dev(p, "class", "svelte-epmkex");
    			add_location(p, file$m, 99, 20, 3742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(99:39) ",
    		ctx
    	});

    	return block;
    }

    // (97:38) 
    function create_if_block_2$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "'You got a letter right!'";
    			attr_dev(p, "class", "svelte-epmkex");
    			add_location(p, file$m, 97, 20, 3649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(97:38) ",
    		ctx
    	});

    	return block;
    }

    // (95:52) 
    function create_if_block_1$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "New Game";
    			attr_dev(p, "class", "svelte-epmkex");
    			add_location(p, file$m, 95, 20, 3574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(95:52) ",
    		ctx
    	});

    	return block;
    }

    // (93:20) {#if won}
    function create_if_block$7(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "'You won! Click reset to play again'";
    			attr_dev(p, "class", "congrats svelte-epmkex");
    			add_location(p, file$m, 93, 20, 3440);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(93:20) {#if won}",
    		ctx
    	});

    	return block;
    }

    // (104:24) <Button on:click={() => start()}>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reset");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(104:24) <Button on:click={() => start()}>",
    		ctx
    	});

    	return block;
    }

    // (108:20) {#each hangman as man}
    function create_each_block$2(ctx) {
    	let p;
    	let t_value = /*man*/ ctx[25] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "man svelte-epmkex");
    			add_location(p, file$m, 108, 20, 4135);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hangman*/ 64 && t_value !== (t_value = /*man*/ ctx[25] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(108:20) {#each hangman as man}",
    		ctx
    	});

    	return block;
    }

    // (72:8) <Card>
    function create_default_slot$6(ctx) {
    	let h1;
    	let t1;
    	let apinputs;
    	let t2;
    	let t3;
    	let div4;
    	let div2;
    	let current_block_type_index;
    	let if_block1;
    	let t4;
    	let span;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let div0;
    	let t9_value = /*game*/ ctx[0].join(" ") + "";
    	let t9;
    	let t10;
    	let div1;
    	let button;
    	let t11;
    	let div3;
    	let current;
    	apinputs = new APIinputs({ $$inline: true });
    	apinputs.$on("getlist", /*getList*/ ctx[9]);
    	let if_block0 = /*toggle*/ ctx[3] && create_if_block_6(ctx);
    	const if_block_creators = [create_if_block_4, create_if_block_5];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*won*/ ctx[1] && /*chances*/ ctx[7] > 0) return 0;
    		if (!/*chances*/ ctx[7]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function select_block_type_1(ctx, dirty) {
    		if (/*won*/ ctx[1]) return create_if_block$7;
    		if (/*correct*/ ctx[4] === undefined) return create_if_block_1$2;
    		if (/*correct*/ ctx[4]) return create_if_block_2$1;
    		if (!/*correct*/ ctx[4]) return create_if_block_3$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type && current_block_type(ctx);

    	button = new Button_1({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_1*/ ctx[15]);
    	let each_value = /*hangman*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Welcome to Hangman";
    			t1 = space();
    			create_component(apinputs.$$.fragment);
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();
    			div4 = element("div");
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			t4 = space();
    			span = element("span");
    			t5 = text("Wrong guesses: ");
    			t6 = text(/*guesses*/ ctx[5]);
    			t7 = space();
    			if (if_block2) if_block2.c();
    			t8 = space();
    			div0 = element("div");
    			t9 = text(t9_value);
    			t10 = space();
    			div1 = element("div");
    			create_component(button.$$.fragment);
    			t11 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-epmkex");
    			add_location(h1, file$m, 72, 12, 2490);
    			attr_dev(span, "class", "svelte-epmkex");
    			add_location(span, file$m, 91, 20, 3351);
    			attr_dev(div0, "id", "game");
    			attr_dev(div0, "class", "svelte-epmkex");
    			add_location(div0, file$m, 101, 20, 3823);
    			attr_dev(div1, "class", "btn-container svelte-epmkex");
    			add_location(div1, file$m, 102, 20, 3881);
    			attr_dev(div2, "class", "flex-item1 svelte-epmkex");
    			add_location(div2, file$m, 79, 16, 2712);
    			attr_dev(div3, "class", "flex-item2 svelte-epmkex");
    			add_location(div3, file$m, 106, 16, 4047);
    			attr_dev(div4, "class", "flex-box svelte-epmkex");
    			add_location(div4, file$m, 78, 12, 2673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(apinputs, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div2, null);
    			}

    			append_dev(div2, t4);
    			append_dev(div2, span);
    			append_dev(span, t5);
    			append_dev(span, t6);
    			append_dev(div2, t7);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t8);
    			append_dev(div2, div0);
    			append_dev(div0, t9);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    			mount_component(button, div1, null);
    			append_dev(div4, t11);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*toggle*/ ctx[3]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(t3.parentNode, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div2, t4);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (!current || dirty & /*guesses*/ 32) set_data_dev(t6, /*guesses*/ ctx[5]);

    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type && current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div2, t8);
    				}
    			}

    			if ((!current || dirty & /*game*/ 1) && t9_value !== (t9_value = /*game*/ ctx[0].join(" ") + "")) set_data_dev(t9, t9_value);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 268435456) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (dirty & /*hangman*/ 64) {
    				each_value = /*hangman*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(apinputs.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(apinputs.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			destroy_component(apinputs, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (if_block2) {
    				if_block2.d();
    			}

    			destroy_component(button);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(72:8) <Card>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let main;
    	let card;
    	let main_transition;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(card.$$.fragment);
    			attr_dev(main, "class", "svelte-epmkex");
    			add_location(main, file$m, 70, 4, 2364);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(card, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const card_changes = {};

    			if (dirty & /*$$scope, hangman, game, won, correct, guesses, text, chances, gameOver, toggle*/ 268435967) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);

    			add_render_callback(() => {
    				if (!main_transition) main_transition = create_bidirectional_transition(
    					main,
    					scale,
    					{
    						duration: 1000,
    						delay: 200,
    						opacity: 0.5,
    						start: 0,
    						easing: quintOut
    					},
    					true
    				);

    				main_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);

    			if (!main_transition) main_transition = create_bidirectional_transition(
    				main,
    				scale,
    				{
    					duration: 1000,
    					delay: 200,
    					opacity: 0.5,
    					start: 0,
    					easing: quintOut
    				},
    				false
    			);

    			main_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(card);
    			if (detaching && main_transition) main_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(19, $count = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hangman", slots, []);
    	let game = [];
    	let won;
    	let word;
    	let wordArr = [];
    	let text;
    	let toggle = false;
    	let correct;
    	let guesses = [];
    	let graphic = ["", "___", "|  O", "| -|-", "|  /|", "|___"];
    	let hangman = [];

    	let wordList = [
    		"apple",
    		"answer",
    		"anchor",
    		"bananna",
    		"berry",
    		"boat",
    		"boot",
    		"cape",
    		"cap",
    		"case",
    		"chip",
    		"cherry",
    		"cone",
    		"dark",
    		"deep",
    		"donkey",
    		"eight",
    		"ever",
    		"elephant",
    		"fire",
    		"food",
    		"good",
    		"great",
    		"hour",
    		"ink",
    		"jar",
    		"jump",
    		"juggle",
    		"kick",
    		"kangaroo",
    		"leopard",
    		"moon",
    		"night",
    		"opera",
    		"people",
    		"quiet",
    		"right",
    		"scissor",
    		"temple",
    		"unicorn",
    		"victorious",
    		"wink",
    		"xylophone",
    		"yelp",
    		"zebra"
    	]; //list game chooses from

    	const getList = e => {
    		wordList = [];
    		wordList = e.detail.map(el => el.word);
    		console.log(wordList);
    		start();

    		wordList
    		? $$invalidate(3, toggle = true)
    		: $$invalidate(3, toggle = false);
    	};

    	const randWord = () => wordList[Math.floor(Math.random() * wordList.length)];

    	const start = () => {
    		$$invalidate(1, won = false);
    		$$invalidate(3, toggle = false);
    		word = randWord();
    		$$invalidate(6, hangman = []);
    		$$invalidate(5, guesses = []);
    		$$invalidate(4, correct = undefined);
    		$$invalidate(2, text = "");
    		$$invalidate(17, wordArr = word.split("")); //turns the string into an array
    		$$invalidate(0, game = wordArr.map(e => e = "_"));
    	};

    	const checkGuess = letter => wordArr.includes(letter) ? play(letter) : wrong(letter);

    	const wrong = letter => {
    		$$invalidate(6, hangman = [...hangman, graphic[guesses.length]]);
    		$$invalidate(5, guesses = [...guesses, letter]);
    		$$invalidate(4, correct = false);
    	};

    	const play = letter => {
    		wordArr.forEach((el, index) => el === letter
    		? $$invalidate(0, game[index] = letter, game)
    		: null);

    		compareArrays();
    		$$invalidate(4, correct = true);
    	};

    	const compareArrays = () => JSON.stringify(game) === JSON.stringify(wordArr)
    	? $$invalidate(1, won = true)
    	: $$invalidate(1, won = false);

    	start();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Hangman> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(2, text);
    	}

    	const keydown_handler = event => {
    		if (event.key === "Enter") checkGuess(text.toLowerCase());
    	};

    	const click_handler = () => checkGuess(text.toLowerCase());
    	const click_handler_1 = () => start();

    	$$self.$capture_state = () => ({
    		fly,
    		fade,
    		scale,
    		quintOut,
    		APInputs: APIinputs,
    		count,
    		Card,
    		Button: Button_1,
    		game,
    		won,
    		word,
    		wordArr,
    		text,
    		toggle,
    		correct,
    		guesses,
    		graphic,
    		hangman,
    		wordList,
    		getList,
    		randWord,
    		start,
    		checkGuess,
    		wrong,
    		play,
    		compareArrays,
    		chances,
    		$count,
    		gameOver
    	});

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("won" in $$props) $$invalidate(1, won = $$props.won);
    		if ("word" in $$props) word = $$props.word;
    		if ("wordArr" in $$props) $$invalidate(17, wordArr = $$props.wordArr);
    		if ("text" in $$props) $$invalidate(2, text = $$props.text);
    		if ("toggle" in $$props) $$invalidate(3, toggle = $$props.toggle);
    		if ("correct" in $$props) $$invalidate(4, correct = $$props.correct);
    		if ("guesses" in $$props) $$invalidate(5, guesses = $$props.guesses);
    		if ("graphic" in $$props) graphic = $$props.graphic;
    		if ("hangman" in $$props) $$invalidate(6, hangman = $$props.hangman);
    		if ("wordList" in $$props) wordList = $$props.wordList;
    		if ("chances" in $$props) $$invalidate(7, chances = $$props.chances);
    		if ("gameOver" in $$props) $$invalidate(8, gameOver = $$props.gameOver);
    	};

    	let chances;
    	let gameOver;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*guesses*/ 32) {
    			 $$invalidate(7, chances = 6 - guesses.length);
    		}

    		if ($$self.$$.dirty & /*won, $count*/ 524290) {
    			 won && set_store_value(count, $count++, $count);
    		}

    		if ($$self.$$.dirty & /*chances, $count*/ 524416) {
    			 !chances && set_store_value(count, $count--, $count);
    		}

    		if ($$self.$$.dirty & /*wordArr*/ 131072) {
    			 $$invalidate(8, gameOver = `${wordArr.join("")} was the word. Game Over, Click Restart to play again.`);
    		}
    	};

    	return [
    		game,
    		won,
    		text,
    		toggle,
    		correct,
    		guesses,
    		hangman,
    		chances,
    		gameOver,
    		getList,
    		start,
    		checkGuess,
    		input_input_handler,
    		keydown_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class Hangman extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hangman",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/components/addPlayer.svelte generated by Svelte v3.29.0 */

    const { console: console_1$3 } = globals;
    const file$n = "src/components/addPlayer.svelte";

    function create_fragment$r(ctx) {
    	let form;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "reset score";
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Your name");
    			add_location(input0, file$n, 36, 4, 776);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Save";
    			attr_dev(input1, "class", "btn");
    			add_location(input1, file$n, 37, 4, 842);
    			attr_dev(form, "class", "controls svelte-7st4z6");
    			add_location(form, file$n, 35, 0, 712);
    			add_location(button, file$n, 39, 22, 921);
    			attr_dev(div, "class", "controls svelte-7st4z6");
    			add_location(div, file$n, 39, 0, 899);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(form, t0);
    			append_dev(form, input1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(form, "submit", prevent_default(/*onSubmit*/ ctx[2]), false, true, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let $count;
    	let $players;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(1, $count = $$value));
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(9, $players = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddPlayer", slots, []);
    	let name;
    	let pid = 2;
    	let bio;
    	let picture;

    	const onSubmit = async () => {
    		$$invalidate(5, pid++, pid);
    		await gitGet(name);
    		set_store_value(players, $players = [...$players, player], $players);
    	};

    	async function gitGet(input) {
    		let url = "https://api.github.com/users/" + input;

    		try {
    			const response = await fetch(url);
    			const data = await response.json();
    			$$invalidate(6, bio = `bio: ${data.bio}`);
    			$$invalidate(7, picture = data.avatar_url);
    			console.log(data);
    		} catch(error) {
    			console.error(error);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<AddPlayer> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	const click_handler = () => set_store_value(count, $count = 0, $count);

    	$$self.$capture_state = () => ({
    		count,
    		players,
    		name,
    		pid,
    		bio,
    		picture,
    		onSubmit,
    		gitGet,
    		player,
    		$count,
    		$players
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("pid" in $$props) $$invalidate(5, pid = $$props.pid);
    		if ("bio" in $$props) $$invalidate(6, bio = $$props.bio);
    		if ("picture" in $$props) $$invalidate(7, picture = $$props.picture);
    		if ("player" in $$props) player = $$props.player;
    	};

    	let player;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pid, name, picture, $count, bio*/ 227) {
    			 player = {
    				id: pid,
    				name,
    				picture,
    				points: $count,
    				bio
    			};
    		}
    	};

    	return [name, $count, onSubmit, input0_input_handler, click_handler];
    }

    class AddPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddPlayer",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.29.0 */
    const file$o = "src/pages/index.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (32:2) {#if showCtrl}
    function create_if_block_4$1(ctx) {
    	let addplayer;
    	let t0;
    	let form;
    	let input0;
    	let t1;
    	let input1;
    	let current;
    	let mounted;
    	let dispose;
    	addplayer = new AddPlayer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addplayer.$$.fragment);
    			t0 = space();
    			form = element("form");
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Player to remove");
    			add_location(input0, file$o, 34, 3, 948);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Remove Player";
    			attr_dev(input1, "class", "button svelte-1vb7ovi");
    			add_location(input1, file$o, 35, 3, 1020);
    			add_location(form, file$o, 33, 2, 899);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addplayer, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(form, t1);
    			append_dev(form, input1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(form, "click", prevent_default(/*removePlayer*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addplayer, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(32:2) {#if showCtrl}",
    		ctx
    	});

    	return block;
    }

    // (39:66) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(39:66) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:48) {#if showCtrl}
    function create_if_block_3$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hide");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(39:48) {#if showCtrl}",
    		ctx
    	});

    	return block;
    }

    // (39:2) <Button on:click={() => showCtrl = !showCtrl}>
    function create_default_slot_7$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*showCtrl*/ ctx[1]) return create_if_block_3$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(39:2) <Button on:click={() => showCtrl = !showCtrl}>",
    		ctx
    	});

    	return block;
    }

    // (42:1) <Paper elevation={1} >
    function create_default_slot_6$1(ctx) {
    	let div;
    	let h2;
    	let t0_value = /*currPlayer*/ ctx[6].name + "";
    	let t0;
    	let t1;
    	let h3;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("points: ");
    			t3 = text(/*$count*/ ctx[4]);
    			attr_dev(h2, "class", "svelte-1vb7ovi");
    			add_location(h2, file$o, 43, 3, 1254);
    			attr_dev(h3, "class", "svelte-1vb7ovi");
    			add_location(h3, file$o, 44, 3, 1284);
    			attr_dev(div, "class", "currPlayer svelte-1vb7ovi");
    			add_location(div, file$o, 42, 2, 1226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(div, t1);
    			append_dev(div, h3);
    			append_dev(h3, t2);
    			append_dev(h3, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currPlayer*/ 64 && t0_value !== (t0_value = /*currPlayer*/ ctx[6].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$count*/ 16) set_data_dev(t3, /*$count*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(42:1) <Paper elevation={1} >",
    		ctx
    	});

    	return block;
    }

    // (54:3) <Paper on:mouseover={() => height[0] = 4} elevation={height[0]} on:mouseout={() => height[0] = 1}>
    function create_default_slot_5$1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Tic Tac Toe";
    			attr_dev(a, "href", "./ttt");
    			add_location(a, file$o, 54, 4, 1513);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(54:3) <Paper on:mouseover={() => height[0] = 4} elevation={height[0]} on:mouseout={() => height[0] = 1}>",
    		ctx
    	});

    	return block;
    }

    // (58:3) <Paper on:mouseover={() => height[1] = 4} elevation={height[1]} on:mouseout={() => height[1] = 1}>
    function create_default_slot_4$1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Hangman";
    			attr_dev(a, "href", "./hangman");
    			add_location(a, file$o, 58, 4, 1672);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(58:3) <Paper on:mouseover={() => height[1] = 4} elevation={height[1]} on:mouseout={() => height[1] = 1}>",
    		ctx
    	});

    	return block;
    }

    // (62:3) <Paper on:mouseover={() => height[2] = 4} elevation={height[2]} on:mouseout={() => height[2] = 1}>
    function create_default_slot_3$1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Bash";
    			attr_dev(a, "href", "./terminal");
    			add_location(a, file$o, 62, 4, 1831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(62:3) <Paper on:mouseover={() => height[2] = 4} elevation={height[2]} on:mouseout={() => height[2] = 1}>",
    		ctx
    	});

    	return block;
    }

    // (51:1) <Card padded>
    function create_default_slot_2$2(ctx) {
    	let h2;
    	let t1;
    	let div;
    	let paper0;
    	let t2;
    	let br0;
    	let t3;
    	let paper1;
    	let t4;
    	let br1;
    	let t5;
    	let paper2;
    	let current;

    	paper0 = new Paper({
    			props: {
    				elevation: /*height*/ ctx[2][0],
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paper0.$on("mouseover", /*mouseover_handler*/ ctx[10]);
    	paper0.$on("mouseout", /*mouseout_handler*/ ctx[11]);

    	paper1 = new Paper({
    			props: {
    				elevation: /*height*/ ctx[2][1],
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paper1.$on("mouseover", /*mouseover_handler_1*/ ctx[12]);
    	paper1.$on("mouseout", /*mouseout_handler_1*/ ctx[13]);

    	paper2 = new Paper({
    			props: {
    				elevation: /*height*/ ctx[2][2],
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paper2.$on("mouseover", /*mouseover_handler_2*/ ctx[14]);
    	paper2.$on("mouseout", /*mouseout_handler_2*/ ctx[15]);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Games";
    			t1 = space();
    			div = element("div");
    			create_component(paper0.$$.fragment);
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			create_component(paper1.$$.fragment);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			create_component(paper2.$$.fragment);
    			attr_dev(h2, "id", "minibar");
    			attr_dev(h2, "class", "svelte-1vb7ovi");
    			add_location(h2, file$o, 51, 2, 1354);
    			add_location(br0, file$o, 56, 3, 1560);
    			add_location(br1, file$o, 60, 3, 1719);
    			attr_dev(div, "class", "gameList svelte-1vb7ovi");
    			add_location(div, file$o, 52, 2, 1384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(paper0, div, null);
    			append_dev(div, t2);
    			append_dev(div, br0);
    			append_dev(div, t3);
    			mount_component(paper1, div, null);
    			append_dev(div, t4);
    			append_dev(div, br1);
    			append_dev(div, t5);
    			mount_component(paper2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paper0_changes = {};
    			if (dirty & /*height*/ 4) paper0_changes.elevation = /*height*/ ctx[2][0];

    			if (dirty & /*$$scope*/ 2097152) {
    				paper0_changes.$$scope = { dirty, ctx };
    			}

    			paper0.$set(paper0_changes);
    			const paper1_changes = {};
    			if (dirty & /*height*/ 4) paper1_changes.elevation = /*height*/ ctx[2][1];

    			if (dirty & /*$$scope*/ 2097152) {
    				paper1_changes.$$scope = { dirty, ctx };
    			}

    			paper1.$set(paper1_changes);
    			const paper2_changes = {};
    			if (dirty & /*height*/ 4) paper2_changes.elevation = /*height*/ ctx[2][2];

    			if (dirty & /*$$scope*/ 2097152) {
    				paper2_changes.$$scope = { dirty, ctx };
    			}

    			paper2.$set(paper2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paper0.$$.fragment, local);
    			transition_in(paper1.$$.fragment, local);
    			transition_in(paper2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paper0.$$.fragment, local);
    			transition_out(paper1.$$.fragment, local);
    			transition_out(paper2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(paper0);
    			destroy_component(paper1);
    			destroy_component(paper2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(51:1) <Card padded>",
    		ctx
    	});

    	return block;
    }

    // (73:65) {:else}
    function create_else_block$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("show");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(73:65) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:45) {#if toggle}
    function create_if_block_2$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("minimize");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(73:45) {#if toggle}",
    		ctx
    	});

    	return block;
    }

    // (73:3) <Button on:click={() => toggle = !toggle}>
    function create_default_slot_1$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*toggle*/ ctx[5]) return create_if_block_2$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(73:3) <Button on:click={() => toggle = !toggle}>",
    		ctx
    	});

    	return block;
    }

    // (77:19) 
    function create_if_block_1$3(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$players*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*player*/ ctx[18].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$players*/ 8) {
    				const each_value = /*$players*/ ctx[3];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, fix_and_outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(77:19) ",
    		ctx
    	});

    	return block;
    }

    // (75:2) {#if $players.length === 0}
    function create_if_block$8(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No High Scores";
    			add_location(p, file$o, 75, 3, 2113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(75:2) {#if $players.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (78:3) {#each $players as player (player.id)}
    function create_each_block$3(key_1, ctx) {
    	let div;
    	let player;
    	let t;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	player = new Player({
    			props: {
    				name: /*player*/ ctx[18].name,
    				points: /*player*/ ctx[18].points,
    				id: /*player*/ ctx[18].id,
    				bio: /*player*/ ctx[18].bio,
    				picture: /*player*/ ctx[18].picture
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(player.$$.fragment);
    			t = space();
    			add_location(div, file$o, 78, 4, 2201);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(player, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const player_changes = {};
    			if (dirty & /*$players*/ 8) player_changes.name = /*player*/ ctx[18].name;
    			if (dirty & /*$players*/ 8) player_changes.points = /*player*/ ctx[18].points;
    			if (dirty & /*$players*/ 8) player_changes.id = /*player*/ ctx[18].id;
    			if (dirty & /*$players*/ 8) player_changes.bio = /*player*/ ctx[18].bio;
    			if (dirty & /*$players*/ 8) player_changes.picture = /*player*/ ctx[18].picture;
    			player.$set(player_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(player.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(player.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(player);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(78:3) {#each $players as player (player.id)}",
    		ctx
    	});

    	return block;
    }

    // (70:1) <Card padded>
    function create_default_slot$7(ctx) {
    	let h2;
    	let t1;
    	let div;
    	let button;
    	let t2;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	button = new Button_1({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_1*/ ctx[16]);
    	const if_block_creators = [create_if_block$8, create_if_block_1$3];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*$players*/ ctx[3].length === 0) return 0;
    		if (/*toggle*/ ctx[5]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "High Scores";
    			t1 = space();
    			div = element("div");
    			create_component(button.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h2, "id", "minibar");
    			attr_dev(h2, "class", "svelte-1vb7ovi");
    			add_location(h2, file$o, 70, 2, 1916);
    			attr_dev(div, "class", "btn-container svelte-1vb7ovi");
    			add_location(div, file$o, 71, 2, 1952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			insert_dev(target, t2, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope, toggle*/ 2097184) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			if (detaching) detach_dev(t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(70:1) <Card padded>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$s(ctx) {
    	let main;
    	let div;
    	let t0;
    	let button;
    	let t1;
    	let paper;
    	let t2;
    	let br0;
    	let t3;
    	let card0;
    	let t4;
    	let br1;
    	let t5;
    	let card1;
    	let t6;
    	let footer;
    	let t7;
    	let a;
    	let t9;
    	let current;
    	let if_block = /*showCtrl*/ ctx[1] && create_if_block_4$1(ctx);

    	button = new Button_1({
    			props: {
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[9]);

    	paper = new Paper({
    			props: {
    				elevation: 1,
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card0 = new Card({
    			props: {
    				padded: true,
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card1 = new Card({
    			props: {
    				padded: true,
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(button.$$.fragment);
    			t1 = space();
    			create_component(paper.$$.fragment);
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			create_component(card0.$$.fragment);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			create_component(card1.$$.fragment);
    			t6 = space();
    			footer = element("footer");
    			t7 = text("Visit ");
    			a = element("a");
    			a.textContent = "my Github page";
    			t9 = text(" to see more of my projects.");
    			attr_dev(div, "class", "controls svelte-1vb7ovi");
    			add_location(div, file$o, 30, 1, 842);
    			add_location(br0, file$o, 48, 1, 1331);
    			add_location(br1, file$o, 67, 1, 1893);
    			attr_dev(a, "href", "https://github.com/hobbitronics");
    			attr_dev(a, "target", "blank");
    			add_location(a, file$o, 85, 15, 2409);
    			add_location(footer, file$o, 85, 1, 2395);
    			attr_dev(main, "class", "svelte-1vb7ovi");
    			add_location(main, file$o, 28, 0, 832);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			mount_component(button, div, null);
    			append_dev(main, t1);
    			mount_component(paper, main, null);
    			append_dev(main, t2);
    			append_dev(main, br0);
    			append_dev(main, t3);
    			mount_component(card0, main, null);
    			append_dev(main, t4);
    			append_dev(main, br1);
    			append_dev(main, t5);
    			mount_component(card1, main, null);
    			append_dev(main, t6);
    			append_dev(main, footer);
    			append_dev(footer, t7);
    			append_dev(footer, a);
    			append_dev(footer, t9);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showCtrl*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showCtrl*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope, showCtrl*/ 2097154) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			const paper_changes = {};

    			if (dirty & /*$$scope, $count, currPlayer*/ 2097232) {
    				paper_changes.$$scope = { dirty, ctx };
    			}

    			paper.$set(paper_changes);
    			const card0_changes = {};

    			if (dirty & /*$$scope, height*/ 2097156) {
    				card0_changes.$$scope = { dirty, ctx };
    			}

    			card0.$set(card0_changes);
    			const card1_changes = {};

    			if (dirty & /*$$scope, $players, toggle*/ 2097192) {
    				card1_changes.$$scope = { dirty, ctx };
    			}

    			card1.$set(card1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(button.$$.fragment, local);
    			transition_in(paper.$$.fragment, local);
    			transition_in(card0.$$.fragment, local);
    			transition_in(card1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(button.$$.fragment, local);
    			transition_out(paper.$$.fragment, local);
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			destroy_component(button);
    			destroy_component(paper);
    			destroy_component(card0);
    			destroy_component(card1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let $players;
    	let $count;
    	validate_store(players, "players");
    	component_subscribe($$self, players, $$value => $$invalidate(3, $players = $$value));
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(4, $count = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pages", slots, []);
    	metatags.title = "Arcade with routify";
    	metatags.description = "Play all your favourite games in one spot";
    	let name;
    	let showCtrl = true;
    	let height = [1, 1, 1];
    	const removePlayer = () => set_store_value(players, $players = $players.filter(player => player.name !== name), $players);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	const click_handler = () => $$invalidate(1, showCtrl = !showCtrl);
    	const mouseover_handler = () => $$invalidate(2, height[0] = 4, height);
    	const mouseout_handler = () => $$invalidate(2, height[0] = 1, height);
    	const mouseover_handler_1 = () => $$invalidate(2, height[1] = 4, height);
    	const mouseout_handler_1 = () => $$invalidate(2, height[1] = 1, height);
    	const mouseover_handler_2 = () => $$invalidate(2, height[2] = 4, height);
    	const mouseout_handler_2 = () => $$invalidate(2, height[2] = 1, height);
    	const click_handler_1 = () => $$invalidate(5, toggle = !toggle);

    	$$self.$capture_state = () => ({
    		metatags,
    		flip,
    		Player,
    		AddPlayer,
    		count,
    		players,
    		Button: Button_1,
    		Card,
    		Paper,
    		Title,
    		Subtitle,
    		Content,
    		name,
    		showCtrl,
    		height,
    		removePlayer,
    		$players,
    		$count,
    		toggle,
    		currPlayer
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("showCtrl" in $$props) $$invalidate(1, showCtrl = $$props.showCtrl);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("toggle" in $$props) $$invalidate(5, toggle = $$props.toggle);
    		if ("currPlayer" in $$props) $$invalidate(6, currPlayer = $$props.currPlayer);
    	};

    	let toggle;
    	let currPlayer;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$players, $count*/ 24) {
    			 set_store_value(players, $players[$players.length - 1].points = $count, $players);
    		}

    		if ($$self.$$.dirty & /*$players, $count*/ 24) {
    			 $$invalidate(6, currPlayer = {
    				id: 0,
    				name: $players[$players.length - 1].name,
    				points: $count
    			});
    		}
    	};

    	 $$invalidate(5, toggle = true);

    	return [
    		name,
    		showCtrl,
    		height,
    		$players,
    		$count,
    		toggle,
    		currPlayer,
    		removePlayer,
    		input0_input_handler,
    		click_handler,
    		mouseover_handler,
    		mouseout_handler,
    		mouseover_handler_1,
    		mouseout_handler_1,
    		mouseover_handler_2,
    		mouseout_handler_2,
    		click_handler_1
    	];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$4 = {
        LABEL_FLOAT_ABOVE: 'mdc-floating-label--float-above',
        LABEL_SHAKE: 'mdc-floating-label--shake',
        ROOT: 'mdc-floating-label',
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFloatingLabelFoundation = /** @class */ (function (_super) {
        __extends(MDCFloatingLabelFoundation, _super);
        function MDCFloatingLabelFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCFloatingLabelFoundation.defaultAdapter, adapter)) || this;
            _this.shakeAnimationEndHandler_ = function () { return _this.handleShakeAnimationEnd_(); };
            return _this;
        }
        Object.defineProperty(MDCFloatingLabelFoundation, "cssClasses", {
            get: function () {
                return cssClasses$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFloatingLabelFoundation, "defaultAdapter", {
            /**
             * See {@link MDCFloatingLabelAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    getWidth: function () { return 0; },
                    registerInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCFloatingLabelFoundation.prototype.init = function () {
            this.adapter_.registerInteractionHandler('animationend', this.shakeAnimationEndHandler_);
        };
        MDCFloatingLabelFoundation.prototype.destroy = function () {
            this.adapter_.deregisterInteractionHandler('animationend', this.shakeAnimationEndHandler_);
        };
        /**
         * Returns the width of the label element.
         */
        MDCFloatingLabelFoundation.prototype.getWidth = function () {
            return this.adapter_.getWidth();
        };
        /**
         * Styles the label to produce a shake animation to indicate an error.
         * @param shouldShake If true, adds the shake CSS class; otherwise, removes shake class.
         */
        MDCFloatingLabelFoundation.prototype.shake = function (shouldShake) {
            var LABEL_SHAKE = MDCFloatingLabelFoundation.cssClasses.LABEL_SHAKE;
            if (shouldShake) {
                this.adapter_.addClass(LABEL_SHAKE);
            }
            else {
                this.adapter_.removeClass(LABEL_SHAKE);
            }
        };
        /**
         * Styles the label to float or dock.
         * @param shouldFloat If true, adds the float CSS class; otherwise, removes float and shake classes to dock the label.
         */
        MDCFloatingLabelFoundation.prototype.float = function (shouldFloat) {
            var _a = MDCFloatingLabelFoundation.cssClasses, LABEL_FLOAT_ABOVE = _a.LABEL_FLOAT_ABOVE, LABEL_SHAKE = _a.LABEL_SHAKE;
            if (shouldFloat) {
                this.adapter_.addClass(LABEL_FLOAT_ABOVE);
            }
            else {
                this.adapter_.removeClass(LABEL_FLOAT_ABOVE);
                this.adapter_.removeClass(LABEL_SHAKE);
            }
        };
        MDCFloatingLabelFoundation.prototype.handleShakeAnimationEnd_ = function () {
            var LABEL_SHAKE = MDCFloatingLabelFoundation.cssClasses.LABEL_SHAKE;
            this.adapter_.removeClass(LABEL_SHAKE);
        };
        return MDCFloatingLabelFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFloatingLabel = /** @class */ (function (_super) {
        __extends(MDCFloatingLabel, _super);
        function MDCFloatingLabel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCFloatingLabel.attachTo = function (root) {
            return new MDCFloatingLabel(root);
        };
        /**
         * Styles the label to produce the label shake for errors.
         * @param shouldShake If true, shakes the label by adding a CSS class; otherwise, stops shaking by removing the class.
         */
        MDCFloatingLabel.prototype.shake = function (shouldShake) {
            this.foundation_.shake(shouldShake);
        };
        /**
         * Styles the label to float/dock.
         * @param shouldFloat If true, floats the label by adding a CSS class; otherwise, docks it by removing the class.
         */
        MDCFloatingLabel.prototype.float = function (shouldFloat) {
            this.foundation_.float(shouldFloat);
        };
        MDCFloatingLabel.prototype.getWidth = function () {
            return this.foundation_.getWidth();
        };
        MDCFloatingLabel.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                getWidth: function () { return _this.root_.scrollWidth; },
                registerInteractionHandler: function (evtType, handler) { return _this.listen(evtType, handler); },
                deregisterInteractionHandler: function (evtType, handler) { return _this.unlisten(evtType, handler); },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCFloatingLabelFoundation(adapter);
        };
        return MDCFloatingLabel;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$5 = {
        LINE_RIPPLE_ACTIVE: 'mdc-line-ripple--active',
        LINE_RIPPLE_DEACTIVATING: 'mdc-line-ripple--deactivating',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCLineRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCLineRippleFoundation, _super);
        function MDCLineRippleFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCLineRippleFoundation.defaultAdapter, adapter)) || this;
            _this.transitionEndHandler_ = function (evt) { return _this.handleTransitionEnd(evt); };
            return _this;
        }
        Object.defineProperty(MDCLineRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCLineRippleFoundation, "defaultAdapter", {
            /**
             * See {@link MDCLineRippleAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setStyle: function () { return undefined; },
                    registerEventHandler: function () { return undefined; },
                    deregisterEventHandler: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCLineRippleFoundation.prototype.init = function () {
            this.adapter_.registerEventHandler('transitionend', this.transitionEndHandler_);
        };
        MDCLineRippleFoundation.prototype.destroy = function () {
            this.adapter_.deregisterEventHandler('transitionend', this.transitionEndHandler_);
        };
        MDCLineRippleFoundation.prototype.activate = function () {
            this.adapter_.removeClass(cssClasses$5.LINE_RIPPLE_DEACTIVATING);
            this.adapter_.addClass(cssClasses$5.LINE_RIPPLE_ACTIVE);
        };
        MDCLineRippleFoundation.prototype.setRippleCenter = function (xCoordinate) {
            this.adapter_.setStyle('transform-origin', xCoordinate + "px center");
        };
        MDCLineRippleFoundation.prototype.deactivate = function () {
            this.adapter_.addClass(cssClasses$5.LINE_RIPPLE_DEACTIVATING);
        };
        MDCLineRippleFoundation.prototype.handleTransitionEnd = function (evt) {
            // Wait for the line ripple to be either transparent or opaque
            // before emitting the animation end event
            var isDeactivating = this.adapter_.hasClass(cssClasses$5.LINE_RIPPLE_DEACTIVATING);
            if (evt.propertyName === 'opacity') {
                if (isDeactivating) {
                    this.adapter_.removeClass(cssClasses$5.LINE_RIPPLE_ACTIVE);
                    this.adapter_.removeClass(cssClasses$5.LINE_RIPPLE_DEACTIVATING);
                }
            }
        };
        return MDCLineRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCLineRipple = /** @class */ (function (_super) {
        __extends(MDCLineRipple, _super);
        function MDCLineRipple() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCLineRipple.attachTo = function (root) {
            return new MDCLineRipple(root);
        };
        /**
         * Activates the line ripple
         */
        MDCLineRipple.prototype.activate = function () {
            this.foundation_.activate();
        };
        /**
         * Deactivates the line ripple
         */
        MDCLineRipple.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        /**
         * Sets the transform origin given a user's click location.
         * The `rippleCenter` is the x-coordinate of the middle of the ripple.
         */
        MDCLineRipple.prototype.setRippleCenter = function (xCoordinate) {
            this.foundation_.setRippleCenter(xCoordinate);
        };
        MDCLineRipple.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                setStyle: function (propertyName, value) { return _this.root_.style.setProperty(propertyName, value); },
                registerEventHandler: function (evtType, handler) { return _this.listen(evtType, handler); },
                deregisterEventHandler: function (evtType, handler) { return _this.unlisten(evtType, handler); },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCLineRippleFoundation(adapter);
        };
        return MDCLineRipple;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$4 = {
        NOTCH_ELEMENT_SELECTOR: '.mdc-notched-outline__notch',
    };
    var numbers$4 = {
        // This should stay in sync with $mdc-notched-outline-padding * 2.
        NOTCH_ELEMENT_PADDING: 8,
    };
    var cssClasses$6 = {
        NO_LABEL: 'mdc-notched-outline--no-label',
        OUTLINE_NOTCHED: 'mdc-notched-outline--notched',
        OUTLINE_UPGRADED: 'mdc-notched-outline--upgraded',
    };

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCNotchedOutlineFoundation = /** @class */ (function (_super) {
        __extends(MDCNotchedOutlineFoundation, _super);
        function MDCNotchedOutlineFoundation(adapter) {
            return _super.call(this, __assign({}, MDCNotchedOutlineFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCNotchedOutlineFoundation, "strings", {
            get: function () {
                return strings$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCNotchedOutlineFoundation, "cssClasses", {
            get: function () {
                return cssClasses$6;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCNotchedOutlineFoundation, "numbers", {
            get: function () {
                return numbers$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCNotchedOutlineFoundation, "defaultAdapter", {
            /**
             * See {@link MDCNotchedOutlineAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    setNotchWidthProperty: function () { return undefined; },
                    removeNotchWidthProperty: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Adds the outline notched selector and updates the notch width calculated based off of notchWidth.
         */
        MDCNotchedOutlineFoundation.prototype.notch = function (notchWidth) {
            var OUTLINE_NOTCHED = MDCNotchedOutlineFoundation.cssClasses.OUTLINE_NOTCHED;
            if (notchWidth > 0) {
                notchWidth += numbers$4.NOTCH_ELEMENT_PADDING; // Add padding from left/right.
            }
            this.adapter_.setNotchWidthProperty(notchWidth);
            this.adapter_.addClass(OUTLINE_NOTCHED);
        };
        /**
         * Removes notched outline selector to close the notch in the outline.
         */
        MDCNotchedOutlineFoundation.prototype.closeNotch = function () {
            var OUTLINE_NOTCHED = MDCNotchedOutlineFoundation.cssClasses.OUTLINE_NOTCHED;
            this.adapter_.removeClass(OUTLINE_NOTCHED);
            this.adapter_.removeNotchWidthProperty();
        };
        return MDCNotchedOutlineFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCNotchedOutline = /** @class */ (function (_super) {
        __extends(MDCNotchedOutline, _super);
        function MDCNotchedOutline() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCNotchedOutline.attachTo = function (root) {
            return new MDCNotchedOutline(root);
        };
        MDCNotchedOutline.prototype.initialSyncWithDOM = function () {
            this.notchElement_ = this.root_.querySelector(strings$4.NOTCH_ELEMENT_SELECTOR);
            var label = this.root_.querySelector('.' + MDCFloatingLabelFoundation.cssClasses.ROOT);
            if (label) {
                label.style.transitionDuration = '0s';
                this.root_.classList.add(cssClasses$6.OUTLINE_UPGRADED);
                requestAnimationFrame(function () {
                    label.style.transitionDuration = '';
                });
            }
            else {
                this.root_.classList.add(cssClasses$6.NO_LABEL);
            }
        };
        /**
         * Updates classes and styles to open the notch to the specified width.
         * @param notchWidth The notch width in the outline.
         */
        MDCNotchedOutline.prototype.notch = function (notchWidth) {
            this.foundation_.notch(notchWidth);
        };
        /**
         * Updates classes and styles to close the notch.
         */
        MDCNotchedOutline.prototype.closeNotch = function () {
            this.foundation_.closeNotch();
        };
        MDCNotchedOutline.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                setNotchWidthProperty: function (width) { return _this.notchElement_.style.setProperty('width', width + 'px'); },
                removeNotchWidthProperty: function () { return _this.notchElement_.style.removeProperty('width'); },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCNotchedOutlineFoundation(adapter);
        };
        return MDCNotchedOutline;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$7 = {
        ROOT: 'mdc-text-field-character-counter',
    };
    var strings$5 = {
        ROOT_SELECTOR: "." + cssClasses$7.ROOT,
    };

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTextFieldCharacterCounterFoundation = /** @class */ (function (_super) {
        __extends(MDCTextFieldCharacterCounterFoundation, _super);
        function MDCTextFieldCharacterCounterFoundation(adapter) {
            return _super.call(this, __assign({}, MDCTextFieldCharacterCounterFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCTextFieldCharacterCounterFoundation, "cssClasses", {
            get: function () {
                return cssClasses$7;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldCharacterCounterFoundation, "strings", {
            get: function () {
                return strings$5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldCharacterCounterFoundation, "defaultAdapter", {
            /**
             * See {@link MDCTextFieldCharacterCounterAdapter} for typing information on parameters and return types.
             */
            get: function () {
                return {
                    setContent: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCTextFieldCharacterCounterFoundation.prototype.setCounterValue = function (currentLength, maxLength) {
            currentLength = Math.min(currentLength, maxLength);
            this.adapter_.setContent(currentLength + " / " + maxLength);
        };
        return MDCTextFieldCharacterCounterFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTextFieldCharacterCounter = /** @class */ (function (_super) {
        __extends(MDCTextFieldCharacterCounter, _super);
        function MDCTextFieldCharacterCounter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTextFieldCharacterCounter.attachTo = function (root) {
            return new MDCTextFieldCharacterCounter(root);
        };
        Object.defineProperty(MDCTextFieldCharacterCounter.prototype, "foundation", {
            get: function () {
                return this.foundation_;
            },
            enumerable: true,
            configurable: true
        });
        MDCTextFieldCharacterCounter.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                setContent: function (content) {
                    _this.root_.textContent = content;
                },
            };
            return new MDCTextFieldCharacterCounterFoundation(adapter);
        };
        return MDCTextFieldCharacterCounter;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$6 = {
        ARIA_CONTROLS: 'aria-controls',
        ICON_SELECTOR: '.mdc-text-field__icon',
        INPUT_SELECTOR: '.mdc-text-field__input',
        LABEL_SELECTOR: '.mdc-floating-label',
        LINE_RIPPLE_SELECTOR: '.mdc-line-ripple',
        OUTLINE_SELECTOR: '.mdc-notched-outline',
    };
    var cssClasses$8 = {
        DENSE: 'mdc-text-field--dense',
        DISABLED: 'mdc-text-field--disabled',
        FOCUSED: 'mdc-text-field--focused',
        FULLWIDTH: 'mdc-text-field--fullwidth',
        HELPER_LINE: 'mdc-text-field-helper-line',
        INVALID: 'mdc-text-field--invalid',
        NO_LABEL: 'mdc-text-field--no-label',
        OUTLINED: 'mdc-text-field--outlined',
        ROOT: 'mdc-text-field',
        TEXTAREA: 'mdc-text-field--textarea',
        WITH_LEADING_ICON: 'mdc-text-field--with-leading-icon',
        WITH_TRAILING_ICON: 'mdc-text-field--with-trailing-icon',
    };
    var numbers$5 = {
        DENSE_LABEL_SCALE: 0.923,
        LABEL_SCALE: 0.75,
    };
    /**
     * Whitelist based off of https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
     * under the "Validation-related attributes" section.
     */
    var VALIDATION_ATTR_WHITELIST = [
        'pattern', 'min', 'max', 'required', 'step', 'minlength', 'maxlength',
    ];
    /**
     * Label should always float for these types as they show some UI even if value is empty.
     */
    var ALWAYS_FLOAT_TYPES = [
        'color', 'date', 'datetime-local', 'month', 'range', 'time', 'week',
    ];

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var POINTERDOWN_EVENTS = ['mousedown', 'touchstart'];
    var INTERACTION_EVENTS = ['click', 'keydown'];
    var MDCTextFieldFoundation = /** @class */ (function (_super) {
        __extends(MDCTextFieldFoundation, _super);
        /**
         * @param adapter
         * @param foundationMap Map from subcomponent names to their subfoundations.
         */
        function MDCTextFieldFoundation(adapter, foundationMap) {
            if (foundationMap === void 0) { foundationMap = {}; }
            var _this = _super.call(this, __assign({}, MDCTextFieldFoundation.defaultAdapter, adapter)) || this;
            _this.isFocused_ = false;
            _this.receivedUserInput_ = false;
            _this.isValid_ = true;
            _this.useNativeValidation_ = true;
            _this.helperText_ = foundationMap.helperText;
            _this.characterCounter_ = foundationMap.characterCounter;
            _this.leadingIcon_ = foundationMap.leadingIcon;
            _this.trailingIcon_ = foundationMap.trailingIcon;
            _this.inputFocusHandler_ = function () { return _this.activateFocus(); };
            _this.inputBlurHandler_ = function () { return _this.deactivateFocus(); };
            _this.inputInputHandler_ = function () { return _this.handleInput(); };
            _this.setPointerXOffset_ = function (evt) { return _this.setTransformOrigin(evt); };
            _this.textFieldInteractionHandler_ = function () { return _this.handleTextFieldInteraction(); };
            _this.validationAttributeChangeHandler_ = function (attributesList) { return _this.handleValidationAttributeChange(attributesList); };
            return _this;
        }
        Object.defineProperty(MDCTextFieldFoundation, "cssClasses", {
            get: function () {
                return cssClasses$8;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldFoundation, "strings", {
            get: function () {
                return strings$6;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldFoundation, "numbers", {
            get: function () {
                return numbers$5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldFoundation.prototype, "shouldAlwaysFloat_", {
            get: function () {
                var type = this.getNativeInput_().type;
                return ALWAYS_FLOAT_TYPES.indexOf(type) >= 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldFoundation.prototype, "shouldFloat", {
            get: function () {
                return this.shouldAlwaysFloat_ || this.isFocused_ || Boolean(this.getValue()) || this.isBadInput_();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldFoundation.prototype, "shouldShake", {
            get: function () {
                return !this.isFocused_ && !this.isValid() && Boolean(this.getValue());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldFoundation, "defaultAdapter", {
            /**
             * See {@link MDCTextFieldAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return true; },
                    registerTextFieldInteractionHandler: function () { return undefined; },
                    deregisterTextFieldInteractionHandler: function () { return undefined; },
                    registerInputInteractionHandler: function () { return undefined; },
                    deregisterInputInteractionHandler: function () { return undefined; },
                    registerValidationAttributeChangeHandler: function () { return new MutationObserver(function () { return undefined; }); },
                    deregisterValidationAttributeChangeHandler: function () { return undefined; },
                    getNativeInput: function () { return null; },
                    isFocused: function () { return false; },
                    activateLineRipple: function () { return undefined; },
                    deactivateLineRipple: function () { return undefined; },
                    setLineRippleTransformOrigin: function () { return undefined; },
                    shakeLabel: function () { return undefined; },
                    floatLabel: function () { return undefined; },
                    hasLabel: function () { return false; },
                    getLabelWidth: function () { return 0; },
                    hasOutline: function () { return false; },
                    notchOutline: function () { return undefined; },
                    closeOutline: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTextFieldFoundation.prototype.init = function () {
            var _this = this;
            if (this.adapter_.isFocused()) {
                this.inputFocusHandler_();
            }
            else if (this.adapter_.hasLabel() && this.shouldFloat) {
                this.notchOutline(true);
                this.adapter_.floatLabel(true);
            }
            this.adapter_.registerInputInteractionHandler('focus', this.inputFocusHandler_);
            this.adapter_.registerInputInteractionHandler('blur', this.inputBlurHandler_);
            this.adapter_.registerInputInteractionHandler('input', this.inputInputHandler_);
            POINTERDOWN_EVENTS.forEach(function (evtType) {
                _this.adapter_.registerInputInteractionHandler(evtType, _this.setPointerXOffset_);
            });
            INTERACTION_EVENTS.forEach(function (evtType) {
                _this.adapter_.registerTextFieldInteractionHandler(evtType, _this.textFieldInteractionHandler_);
            });
            this.validationObserver_ =
                this.adapter_.registerValidationAttributeChangeHandler(this.validationAttributeChangeHandler_);
            this.setCharacterCounter_(this.getValue().length);
        };
        MDCTextFieldFoundation.prototype.destroy = function () {
            var _this = this;
            this.adapter_.deregisterInputInteractionHandler('focus', this.inputFocusHandler_);
            this.adapter_.deregisterInputInteractionHandler('blur', this.inputBlurHandler_);
            this.adapter_.deregisterInputInteractionHandler('input', this.inputInputHandler_);
            POINTERDOWN_EVENTS.forEach(function (evtType) {
                _this.adapter_.deregisterInputInteractionHandler(evtType, _this.setPointerXOffset_);
            });
            INTERACTION_EVENTS.forEach(function (evtType) {
                _this.adapter_.deregisterTextFieldInteractionHandler(evtType, _this.textFieldInteractionHandler_);
            });
            this.adapter_.deregisterValidationAttributeChangeHandler(this.validationObserver_);
        };
        /**
         * Handles user interactions with the Text Field.
         */
        MDCTextFieldFoundation.prototype.handleTextFieldInteraction = function () {
            var nativeInput = this.adapter_.getNativeInput();
            if (nativeInput && nativeInput.disabled) {
                return;
            }
            this.receivedUserInput_ = true;
        };
        /**
         * Handles validation attribute changes
         */
        MDCTextFieldFoundation.prototype.handleValidationAttributeChange = function (attributesList) {
            var _this = this;
            attributesList.some(function (attributeName) {
                if (VALIDATION_ATTR_WHITELIST.indexOf(attributeName) > -1) {
                    _this.styleValidity_(true);
                    return true;
                }
                return false;
            });
            if (attributesList.indexOf('maxlength') > -1) {
                this.setCharacterCounter_(this.getValue().length);
            }
        };
        /**
         * Opens/closes the notched outline.
         */
        MDCTextFieldFoundation.prototype.notchOutline = function (openNotch) {
            if (!this.adapter_.hasOutline()) {
                return;
            }
            if (openNotch) {
                var isDense = this.adapter_.hasClass(cssClasses$8.DENSE);
                var labelScale = isDense ? numbers$5.DENSE_LABEL_SCALE : numbers$5.LABEL_SCALE;
                var labelWidth = this.adapter_.getLabelWidth() * labelScale;
                this.adapter_.notchOutline(labelWidth);
            }
            else {
                this.adapter_.closeOutline();
            }
        };
        /**
         * Activates the text field focus state.
         */
        MDCTextFieldFoundation.prototype.activateFocus = function () {
            this.isFocused_ = true;
            this.styleFocused_(this.isFocused_);
            this.adapter_.activateLineRipple();
            if (this.adapter_.hasLabel()) {
                this.notchOutline(this.shouldFloat);
                this.adapter_.floatLabel(this.shouldFloat);
                this.adapter_.shakeLabel(this.shouldShake);
            }
            if (this.helperText_) {
                this.helperText_.showToScreenReader();
            }
        };
        /**
         * Sets the line ripple's transform origin, so that the line ripple activate
         * animation will animate out from the user's click location.
         */
        MDCTextFieldFoundation.prototype.setTransformOrigin = function (evt) {
            var touches = evt.touches;
            var targetEvent = touches ? touches[0] : evt;
            var targetClientRect = targetEvent.target.getBoundingClientRect();
            var normalizedX = targetEvent.clientX - targetClientRect.left;
            this.adapter_.setLineRippleTransformOrigin(normalizedX);
        };
        /**
         * Handles input change of text input and text area.
         */
        MDCTextFieldFoundation.prototype.handleInput = function () {
            this.autoCompleteFocus();
            this.setCharacterCounter_(this.getValue().length);
        };
        /**
         * Activates the Text Field's focus state in cases when the input value
         * changes without user input (e.g. programmatically).
         */
        MDCTextFieldFoundation.prototype.autoCompleteFocus = function () {
            if (!this.receivedUserInput_) {
                this.activateFocus();
            }
        };
        /**
         * Deactivates the Text Field's focus state.
         */
        MDCTextFieldFoundation.prototype.deactivateFocus = function () {
            this.isFocused_ = false;
            this.adapter_.deactivateLineRipple();
            var isValid = this.isValid();
            this.styleValidity_(isValid);
            this.styleFocused_(this.isFocused_);
            if (this.adapter_.hasLabel()) {
                this.notchOutline(this.shouldFloat);
                this.adapter_.floatLabel(this.shouldFloat);
                this.adapter_.shakeLabel(this.shouldShake);
            }
            if (!this.shouldFloat) {
                this.receivedUserInput_ = false;
            }
        };
        MDCTextFieldFoundation.prototype.getValue = function () {
            return this.getNativeInput_().value;
        };
        /**
         * @param value The value to set on the input Element.
         */
        MDCTextFieldFoundation.prototype.setValue = function (value) {
            // Prevent Safari from moving the caret to the end of the input when the value has not changed.
            if (this.getValue() !== value) {
                this.getNativeInput_().value = value;
            }
            this.setCharacterCounter_(value.length);
            var isValid = this.isValid();
            this.styleValidity_(isValid);
            if (this.adapter_.hasLabel()) {
                this.notchOutline(this.shouldFloat);
                this.adapter_.floatLabel(this.shouldFloat);
                this.adapter_.shakeLabel(this.shouldShake);
            }
        };
        /**
         * @return The custom validity state, if set; otherwise, the result of a native validity check.
         */
        MDCTextFieldFoundation.prototype.isValid = function () {
            return this.useNativeValidation_
                ? this.isNativeInputValid_() : this.isValid_;
        };
        /**
         * @param isValid Sets the custom validity state of the Text Field.
         */
        MDCTextFieldFoundation.prototype.setValid = function (isValid) {
            this.isValid_ = isValid;
            this.styleValidity_(isValid);
            var shouldShake = !isValid && !this.isFocused_;
            if (this.adapter_.hasLabel()) {
                this.adapter_.shakeLabel(shouldShake);
            }
        };
        /**
         * Enables or disables the use of native validation. Use this for custom validation.
         * @param useNativeValidation Set this to false to ignore native input validation.
         */
        MDCTextFieldFoundation.prototype.setUseNativeValidation = function (useNativeValidation) {
            this.useNativeValidation_ = useNativeValidation;
        };
        MDCTextFieldFoundation.prototype.isDisabled = function () {
            return this.getNativeInput_().disabled;
        };
        /**
         * @param disabled Sets the text-field disabled or enabled.
         */
        MDCTextFieldFoundation.prototype.setDisabled = function (disabled) {
            this.getNativeInput_().disabled = disabled;
            this.styleDisabled_(disabled);
        };
        /**
         * @param content Sets the content of the helper text.
         */
        MDCTextFieldFoundation.prototype.setHelperTextContent = function (content) {
            if (this.helperText_) {
                this.helperText_.setContent(content);
            }
        };
        /**
         * Sets the aria label of the leading icon.
         */
        MDCTextFieldFoundation.prototype.setLeadingIconAriaLabel = function (label) {
            if (this.leadingIcon_) {
                this.leadingIcon_.setAriaLabel(label);
            }
        };
        /**
         * Sets the text content of the leading icon.
         */
        MDCTextFieldFoundation.prototype.setLeadingIconContent = function (content) {
            if (this.leadingIcon_) {
                this.leadingIcon_.setContent(content);
            }
        };
        /**
         * Sets the aria label of the trailing icon.
         */
        MDCTextFieldFoundation.prototype.setTrailingIconAriaLabel = function (label) {
            if (this.trailingIcon_) {
                this.trailingIcon_.setAriaLabel(label);
            }
        };
        /**
         * Sets the text content of the trailing icon.
         */
        MDCTextFieldFoundation.prototype.setTrailingIconContent = function (content) {
            if (this.trailingIcon_) {
                this.trailingIcon_.setContent(content);
            }
        };
        /**
         * Sets character counter values that shows characters used and the total character limit.
         */
        MDCTextFieldFoundation.prototype.setCharacterCounter_ = function (currentLength) {
            if (!this.characterCounter_) {
                return;
            }
            var maxLength = this.getNativeInput_().maxLength;
            if (maxLength === -1) {
                throw new Error('MDCTextFieldFoundation: Expected maxlength html property on text input or textarea.');
            }
            this.characterCounter_.setCounterValue(currentLength, maxLength);
        };
        /**
         * @return True if the Text Field input fails in converting the user-supplied value.
         */
        MDCTextFieldFoundation.prototype.isBadInput_ = function () {
            // The badInput property is not supported in IE 11 💩.
            return this.getNativeInput_().validity.badInput || false;
        };
        /**
         * @return The result of native validity checking (ValidityState.valid).
         */
        MDCTextFieldFoundation.prototype.isNativeInputValid_ = function () {
            return this.getNativeInput_().validity.valid;
        };
        /**
         * Styles the component based on the validity state.
         */
        MDCTextFieldFoundation.prototype.styleValidity_ = function (isValid) {
            var INVALID = MDCTextFieldFoundation.cssClasses.INVALID;
            if (isValid) {
                this.adapter_.removeClass(INVALID);
            }
            else {
                this.adapter_.addClass(INVALID);
            }
            if (this.helperText_) {
                this.helperText_.setValidity(isValid);
            }
        };
        /**
         * Styles the component based on the focused state.
         */
        MDCTextFieldFoundation.prototype.styleFocused_ = function (isFocused) {
            var FOCUSED = MDCTextFieldFoundation.cssClasses.FOCUSED;
            if (isFocused) {
                this.adapter_.addClass(FOCUSED);
            }
            else {
                this.adapter_.removeClass(FOCUSED);
            }
        };
        /**
         * Styles the component based on the disabled state.
         */
        MDCTextFieldFoundation.prototype.styleDisabled_ = function (isDisabled) {
            var _a = MDCTextFieldFoundation.cssClasses, DISABLED = _a.DISABLED, INVALID = _a.INVALID;
            if (isDisabled) {
                this.adapter_.addClass(DISABLED);
                this.adapter_.removeClass(INVALID);
            }
            else {
                this.adapter_.removeClass(DISABLED);
            }
            if (this.leadingIcon_) {
                this.leadingIcon_.setDisabled(isDisabled);
            }
            if (this.trailingIcon_) {
                this.trailingIcon_.setDisabled(isDisabled);
            }
        };
        /**
         * @return The native text input element from the host environment, or an object with the same shape for unit tests.
         */
        MDCTextFieldFoundation.prototype.getNativeInput_ = function () {
            // this.adapter_ may be undefined in foundation unit tests. This happens when testdouble is creating a mock object
            // and invokes the shouldShake/shouldFloat getters (which in turn call getValue(), which calls this method) before
            // init() has been called from the MDCTextField constructor. To work around that issue, we return a dummy object.
            var nativeInput = this.adapter_ ? this.adapter_.getNativeInput() : null;
            return nativeInput || {
                disabled: false,
                maxLength: -1,
                type: 'input',
                validity: {
                    badInput: false,
                    valid: true,
                },
                value: '',
            };
        };
        return MDCTextFieldFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$9 = {
        HELPER_TEXT_PERSISTENT: 'mdc-text-field-helper-text--persistent',
        HELPER_TEXT_VALIDATION_MSG: 'mdc-text-field-helper-text--validation-msg',
        ROOT: 'mdc-text-field-helper-text',
    };
    var strings$7 = {
        ARIA_HIDDEN: 'aria-hidden',
        ROLE: 'role',
        ROOT_SELECTOR: "." + cssClasses$9.ROOT,
    };

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTextFieldHelperTextFoundation = /** @class */ (function (_super) {
        __extends(MDCTextFieldHelperTextFoundation, _super);
        function MDCTextFieldHelperTextFoundation(adapter) {
            return _super.call(this, __assign({}, MDCTextFieldHelperTextFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCTextFieldHelperTextFoundation, "cssClasses", {
            get: function () {
                return cssClasses$9;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldHelperTextFoundation, "strings", {
            get: function () {
                return strings$7;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldHelperTextFoundation, "defaultAdapter", {
            /**
             * See {@link MDCTextFieldHelperTextAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setAttr: function () { return undefined; },
                    removeAttr: function () { return undefined; },
                    setContent: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Sets the content of the helper text field.
         */
        MDCTextFieldHelperTextFoundation.prototype.setContent = function (content) {
            this.adapter_.setContent(content);
        };
        /**
         * @param isPersistent Sets the persistency of the helper text.
         */
        MDCTextFieldHelperTextFoundation.prototype.setPersistent = function (isPersistent) {
            if (isPersistent) {
                this.adapter_.addClass(cssClasses$9.HELPER_TEXT_PERSISTENT);
            }
            else {
                this.adapter_.removeClass(cssClasses$9.HELPER_TEXT_PERSISTENT);
            }
        };
        /**
         * @param isValidation True to make the helper text act as an error validation message.
         */
        MDCTextFieldHelperTextFoundation.prototype.setValidation = function (isValidation) {
            if (isValidation) {
                this.adapter_.addClass(cssClasses$9.HELPER_TEXT_VALIDATION_MSG);
            }
            else {
                this.adapter_.removeClass(cssClasses$9.HELPER_TEXT_VALIDATION_MSG);
            }
        };
        /**
         * Makes the helper text visible to the screen reader.
         */
        MDCTextFieldHelperTextFoundation.prototype.showToScreenReader = function () {
            this.adapter_.removeAttr(strings$7.ARIA_HIDDEN);
        };
        /**
         * Sets the validity of the helper text based on the input validity.
         */
        MDCTextFieldHelperTextFoundation.prototype.setValidity = function (inputIsValid) {
            var helperTextIsPersistent = this.adapter_.hasClass(cssClasses$9.HELPER_TEXT_PERSISTENT);
            var helperTextIsValidationMsg = this.adapter_.hasClass(cssClasses$9.HELPER_TEXT_VALIDATION_MSG);
            var validationMsgNeedsDisplay = helperTextIsValidationMsg && !inputIsValid;
            if (validationMsgNeedsDisplay) {
                this.adapter_.setAttr(strings$7.ROLE, 'alert');
            }
            else {
                this.adapter_.removeAttr(strings$7.ROLE);
            }
            if (!helperTextIsPersistent && !validationMsgNeedsDisplay) {
                this.hide_();
            }
        };
        /**
         * Hides the help text from screen readers.
         */
        MDCTextFieldHelperTextFoundation.prototype.hide_ = function () {
            this.adapter_.setAttr(strings$7.ARIA_HIDDEN, 'true');
        };
        return MDCTextFieldHelperTextFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTextFieldHelperText = /** @class */ (function (_super) {
        __extends(MDCTextFieldHelperText, _super);
        function MDCTextFieldHelperText() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTextFieldHelperText.attachTo = function (root) {
            return new MDCTextFieldHelperText(root);
        };
        Object.defineProperty(MDCTextFieldHelperText.prototype, "foundation", {
            get: function () {
                return this.foundation_;
            },
            enumerable: true,
            configurable: true
        });
        MDCTextFieldHelperText.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                setAttr: function (attr, value) { return _this.root_.setAttribute(attr, value); },
                removeAttr: function (attr) { return _this.root_.removeAttribute(attr); },
                setContent: function (content) {
                    _this.root_.textContent = content;
                },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCTextFieldHelperTextFoundation(adapter);
        };
        return MDCTextFieldHelperText;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$8 = {
        ICON_EVENT: 'MDCTextField:icon',
        ICON_ROLE: 'button',
    };
    var cssClasses$a = {
        ROOT: 'mdc-text-field__icon',
    };

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var INTERACTION_EVENTS$1 = ['click', 'keydown'];
    var MDCTextFieldIconFoundation = /** @class */ (function (_super) {
        __extends(MDCTextFieldIconFoundation, _super);
        function MDCTextFieldIconFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCTextFieldIconFoundation.defaultAdapter, adapter)) || this;
            _this.savedTabIndex_ = null;
            _this.interactionHandler_ = function (evt) { return _this.handleInteraction(evt); };
            return _this;
        }
        Object.defineProperty(MDCTextFieldIconFoundation, "strings", {
            get: function () {
                return strings$8;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldIconFoundation, "cssClasses", {
            get: function () {
                return cssClasses$a;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextFieldIconFoundation, "defaultAdapter", {
            /**
             * See {@link MDCTextFieldIconAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    getAttr: function () { return null; },
                    setAttr: function () { return undefined; },
                    removeAttr: function () { return undefined; },
                    setContent: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    notifyIconAction: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTextFieldIconFoundation.prototype.init = function () {
            var _this = this;
            this.savedTabIndex_ = this.adapter_.getAttr('tabindex');
            INTERACTION_EVENTS$1.forEach(function (evtType) {
                _this.adapter_.registerInteractionHandler(evtType, _this.interactionHandler_);
            });
        };
        MDCTextFieldIconFoundation.prototype.destroy = function () {
            var _this = this;
            INTERACTION_EVENTS$1.forEach(function (evtType) {
                _this.adapter_.deregisterInteractionHandler(evtType, _this.interactionHandler_);
            });
        };
        MDCTextFieldIconFoundation.prototype.setDisabled = function (disabled) {
            if (!this.savedTabIndex_) {
                return;
            }
            if (disabled) {
                this.adapter_.setAttr('tabindex', '-1');
                this.adapter_.removeAttr('role');
            }
            else {
                this.adapter_.setAttr('tabindex', this.savedTabIndex_);
                this.adapter_.setAttr('role', strings$8.ICON_ROLE);
            }
        };
        MDCTextFieldIconFoundation.prototype.setAriaLabel = function (label) {
            this.adapter_.setAttr('aria-label', label);
        };
        MDCTextFieldIconFoundation.prototype.setContent = function (content) {
            this.adapter_.setContent(content);
        };
        MDCTextFieldIconFoundation.prototype.handleInteraction = function (evt) {
            var isEnterKey = evt.key === 'Enter' || evt.keyCode === 13;
            if (evt.type === 'click' || isEnterKey) {
                this.adapter_.notifyIconAction();
            }
        };
        return MDCTextFieldIconFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2017 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTextFieldIcon = /** @class */ (function (_super) {
        __extends(MDCTextFieldIcon, _super);
        function MDCTextFieldIcon() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTextFieldIcon.attachTo = function (root) {
            return new MDCTextFieldIcon(root);
        };
        Object.defineProperty(MDCTextFieldIcon.prototype, "foundation", {
            get: function () {
                return this.foundation_;
            },
            enumerable: true,
            configurable: true
        });
        MDCTextFieldIcon.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                getAttr: function (attr) { return _this.root_.getAttribute(attr); },
                setAttr: function (attr, value) { return _this.root_.setAttribute(attr, value); },
                removeAttr: function (attr) { return _this.root_.removeAttribute(attr); },
                setContent: function (content) {
                    _this.root_.textContent = content;
                },
                registerInteractionHandler: function (evtType, handler) { return _this.listen(evtType, handler); },
                deregisterInteractionHandler: function (evtType, handler) { return _this.unlisten(evtType, handler); },
                notifyIconAction: function () { return _this.emit(MDCTextFieldIconFoundation.strings.ICON_EVENT, {} /* evtData */, true /* shouldBubble */); },
            };
            // tslint:enable:object-literal-sort-keys
            return new MDCTextFieldIconFoundation(adapter);
        };
        return MDCTextFieldIcon;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTextField = /** @class */ (function (_super) {
        __extends(MDCTextField, _super);
        function MDCTextField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTextField.attachTo = function (root) {
            return new MDCTextField(root);
        };
        MDCTextField.prototype.initialize = function (rippleFactory, lineRippleFactory, helperTextFactory, characterCounterFactory, iconFactory, labelFactory, outlineFactory) {
            if (rippleFactory === void 0) { rippleFactory = function (el, foundation) { return new MDCRipple(el, foundation); }; }
            if (lineRippleFactory === void 0) { lineRippleFactory = function (el) { return new MDCLineRipple(el); }; }
            if (helperTextFactory === void 0) { helperTextFactory = function (el) { return new MDCTextFieldHelperText(el); }; }
            if (characterCounterFactory === void 0) { characterCounterFactory = function (el) { return new MDCTextFieldCharacterCounter(el); }; }
            if (iconFactory === void 0) { iconFactory = function (el) { return new MDCTextFieldIcon(el); }; }
            if (labelFactory === void 0) { labelFactory = function (el) { return new MDCFloatingLabel(el); }; }
            if (outlineFactory === void 0) { outlineFactory = function (el) { return new MDCNotchedOutline(el); }; }
            this.input_ = this.root_.querySelector(strings$6.INPUT_SELECTOR);
            var labelElement = this.root_.querySelector(strings$6.LABEL_SELECTOR);
            this.label_ = labelElement ? labelFactory(labelElement) : null;
            var lineRippleElement = this.root_.querySelector(strings$6.LINE_RIPPLE_SELECTOR);
            this.lineRipple_ = lineRippleElement ? lineRippleFactory(lineRippleElement) : null;
            var outlineElement = this.root_.querySelector(strings$6.OUTLINE_SELECTOR);
            this.outline_ = outlineElement ? outlineFactory(outlineElement) : null;
            // Helper text
            var helperTextStrings = MDCTextFieldHelperTextFoundation.strings;
            var nextElementSibling = this.root_.nextElementSibling;
            var hasHelperLine = (nextElementSibling && nextElementSibling.classList.contains(cssClasses$8.HELPER_LINE));
            var helperTextEl = hasHelperLine && nextElementSibling && nextElementSibling.querySelector(helperTextStrings.ROOT_SELECTOR);
            this.helperText_ = helperTextEl ? helperTextFactory(helperTextEl) : null;
            // Character counter
            var characterCounterStrings = MDCTextFieldCharacterCounterFoundation.strings;
            var characterCounterEl = this.root_.querySelector(characterCounterStrings.ROOT_SELECTOR);
            // If character counter is not found in root element search in sibling element.
            if (!characterCounterEl && hasHelperLine && nextElementSibling) {
                characterCounterEl = nextElementSibling.querySelector(characterCounterStrings.ROOT_SELECTOR);
            }
            this.characterCounter_ = characterCounterEl ? characterCounterFactory(characterCounterEl) : null;
            this.leadingIcon_ = null;
            this.trailingIcon_ = null;
            var iconElements = this.root_.querySelectorAll(strings$6.ICON_SELECTOR);
            if (iconElements.length > 0) {
                if (iconElements.length > 1) { // Has both icons.
                    this.leadingIcon_ = iconFactory(iconElements[0]);
                    this.trailingIcon_ = iconFactory(iconElements[1]);
                }
                else {
                    if (this.root_.classList.contains(cssClasses$8.WITH_LEADING_ICON)) {
                        this.leadingIcon_ = iconFactory(iconElements[0]);
                    }
                    else {
                        this.trailingIcon_ = iconFactory(iconElements[0]);
                    }
                }
            }
            this.ripple = this.createRipple_(rippleFactory);
        };
        MDCTextField.prototype.destroy = function () {
            if (this.ripple) {
                this.ripple.destroy();
            }
            if (this.lineRipple_) {
                this.lineRipple_.destroy();
            }
            if (this.helperText_) {
                this.helperText_.destroy();
            }
            if (this.characterCounter_) {
                this.characterCounter_.destroy();
            }
            if (this.leadingIcon_) {
                this.leadingIcon_.destroy();
            }
            if (this.trailingIcon_) {
                this.trailingIcon_.destroy();
            }
            if (this.label_) {
                this.label_.destroy();
            }
            if (this.outline_) {
                this.outline_.destroy();
            }
            _super.prototype.destroy.call(this);
        };
        /**
         * Initializes the Text Field's internal state based on the environment's
         * state.
         */
        MDCTextField.prototype.initialSyncWithDOM = function () {
            this.disabled = this.input_.disabled;
        };
        Object.defineProperty(MDCTextField.prototype, "value", {
            get: function () {
                return this.foundation_.getValue();
            },
            /**
             * @param value The value to set on the input.
             */
            set: function (value) {
                this.foundation_.setValue(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "disabled", {
            get: function () {
                return this.foundation_.isDisabled();
            },
            /**
             * @param disabled Sets the Text Field disabled or enabled.
             */
            set: function (disabled) {
                this.foundation_.setDisabled(disabled);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "valid", {
            get: function () {
                return this.foundation_.isValid();
            },
            /**
             * @param valid Sets the Text Field valid or invalid.
             */
            set: function (valid) {
                this.foundation_.setValid(valid);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "required", {
            get: function () {
                return this.input_.required;
            },
            /**
             * @param required Sets the Text Field to required.
             */
            set: function (required) {
                this.input_.required = required;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "pattern", {
            get: function () {
                return this.input_.pattern;
            },
            /**
             * @param pattern Sets the input element's validation pattern.
             */
            set: function (pattern) {
                this.input_.pattern = pattern;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "minLength", {
            get: function () {
                return this.input_.minLength;
            },
            /**
             * @param minLength Sets the input element's minLength.
             */
            set: function (minLength) {
                this.input_.minLength = minLength;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "maxLength", {
            get: function () {
                return this.input_.maxLength;
            },
            /**
             * @param maxLength Sets the input element's maxLength.
             */
            set: function (maxLength) {
                // Chrome throws exception if maxLength is set to a value less than zero
                if (maxLength < 0) {
                    this.input_.removeAttribute('maxLength');
                }
                else {
                    this.input_.maxLength = maxLength;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "min", {
            get: function () {
                return this.input_.min;
            },
            /**
             * @param min Sets the input element's min.
             */
            set: function (min) {
                this.input_.min = min;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "max", {
            get: function () {
                return this.input_.max;
            },
            /**
             * @param max Sets the input element's max.
             */
            set: function (max) {
                this.input_.max = max;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "step", {
            get: function () {
                return this.input_.step;
            },
            /**
             * @param step Sets the input element's step.
             */
            set: function (step) {
                this.input_.step = step;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "helperTextContent", {
            /**
             * Sets the helper text element content.
             */
            set: function (content) {
                this.foundation_.setHelperTextContent(content);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "leadingIconAriaLabel", {
            /**
             * Sets the aria label of the leading icon.
             */
            set: function (label) {
                this.foundation_.setLeadingIconAriaLabel(label);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "leadingIconContent", {
            /**
             * Sets the text content of the leading icon.
             */
            set: function (content) {
                this.foundation_.setLeadingIconContent(content);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "trailingIconAriaLabel", {
            /**
             * Sets the aria label of the trailing icon.
             */
            set: function (label) {
                this.foundation_.setTrailingIconAriaLabel(label);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "trailingIconContent", {
            /**
             * Sets the text content of the trailing icon.
             */
            set: function (content) {
                this.foundation_.setTrailingIconContent(content);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTextField.prototype, "useNativeValidation", {
            /**
             * Enables or disables the use of native validation. Use this for custom validation.
             * @param useNativeValidation Set this to false to ignore native input validation.
             */
            set: function (useNativeValidation) {
                this.foundation_.setUseNativeValidation(useNativeValidation);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Focuses the input element.
         */
        MDCTextField.prototype.focus = function () {
            this.input_.focus();
        };
        /**
         * Recomputes the outline SVG path for the outline element.
         */
        MDCTextField.prototype.layout = function () {
            var openNotch = this.foundation_.shouldFloat;
            this.foundation_.notchOutline(openNotch);
        };
        MDCTextField.prototype.getDefaultFoundation = function () {
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = __assign({}, this.getRootAdapterMethods_(), this.getInputAdapterMethods_(), this.getLabelAdapterMethods_(), this.getLineRippleAdapterMethods_(), this.getOutlineAdapterMethods_());
            // tslint:enable:object-literal-sort-keys
            return new MDCTextFieldFoundation(adapter, this.getFoundationMap_());
        };
        MDCTextField.prototype.getRootAdapterMethods_ = function () {
            var _this = this;
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                registerTextFieldInteractionHandler: function (evtType, handler) { return _this.listen(evtType, handler); },
                deregisterTextFieldInteractionHandler: function (evtType, handler) { return _this.unlisten(evtType, handler); },
                registerValidationAttributeChangeHandler: function (handler) {
                    var getAttributesList = function (mutationsList) {
                        return mutationsList
                            .map(function (mutation) { return mutation.attributeName; })
                            .filter(function (attributeName) { return attributeName; });
                    };
                    var observer = new MutationObserver(function (mutationsList) { return handler(getAttributesList(mutationsList)); });
                    var config = { attributes: true };
                    observer.observe(_this.input_, config);
                    return observer;
                },
                deregisterValidationAttributeChangeHandler: function (observer) { return observer.disconnect(); },
            };
            // tslint:enable:object-literal-sort-keys
        };
        MDCTextField.prototype.getInputAdapterMethods_ = function () {
            var _this = this;
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            return {
                getNativeInput: function () { return _this.input_; },
                isFocused: function () { return document.activeElement === _this.input_; },
                registerInputInteractionHandler: function (evtType, handler) {
                    return _this.input_.addEventListener(evtType, handler, applyPassive());
                },
                deregisterInputInteractionHandler: function (evtType, handler) {
                    return _this.input_.removeEventListener(evtType, handler, applyPassive());
                },
            };
            // tslint:enable:object-literal-sort-keys
        };
        MDCTextField.prototype.getLabelAdapterMethods_ = function () {
            var _this = this;
            return {
                floatLabel: function (shouldFloat) { return _this.label_ && _this.label_.float(shouldFloat); },
                getLabelWidth: function () { return _this.label_ ? _this.label_.getWidth() : 0; },
                hasLabel: function () { return Boolean(_this.label_); },
                shakeLabel: function (shouldShake) { return _this.label_ && _this.label_.shake(shouldShake); },
            };
        };
        MDCTextField.prototype.getLineRippleAdapterMethods_ = function () {
            var _this = this;
            return {
                activateLineRipple: function () {
                    if (_this.lineRipple_) {
                        _this.lineRipple_.activate();
                    }
                },
                deactivateLineRipple: function () {
                    if (_this.lineRipple_) {
                        _this.lineRipple_.deactivate();
                    }
                },
                setLineRippleTransformOrigin: function (normalizedX) {
                    if (_this.lineRipple_) {
                        _this.lineRipple_.setRippleCenter(normalizedX);
                    }
                },
            };
        };
        MDCTextField.prototype.getOutlineAdapterMethods_ = function () {
            var _this = this;
            return {
                closeOutline: function () { return _this.outline_ && _this.outline_.closeNotch(); },
                hasOutline: function () { return Boolean(_this.outline_); },
                notchOutline: function (labelWidth) { return _this.outline_ && _this.outline_.notch(labelWidth); },
            };
        };
        /**
         * @return A map of all subcomponents to subfoundations.
         */
        MDCTextField.prototype.getFoundationMap_ = function () {
            return {
                characterCounter: this.characterCounter_ ? this.characterCounter_.foundation : undefined,
                helperText: this.helperText_ ? this.helperText_.foundation : undefined,
                leadingIcon: this.leadingIcon_ ? this.leadingIcon_.foundation : undefined,
                trailingIcon: this.trailingIcon_ ? this.trailingIcon_.foundation : undefined,
            };
        };
        MDCTextField.prototype.createRipple_ = function (rippleFactory) {
            var _this = this;
            var isTextArea = this.root_.classList.contains(cssClasses$8.TEXTAREA);
            var isOutlined = this.root_.classList.contains(cssClasses$8.OUTLINED);
            if (isTextArea || isOutlined) {
                return null;
            }
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = __assign({}, MDCRipple.createAdapter(this), { isSurfaceActive: function () { return matches(_this.input_, ':active'); }, registerInteractionHandler: function (evtType, handler) { return _this.input_.addEventListener(evtType, handler, applyPassive()); }, deregisterInteractionHandler: function (evtType, handler) {
                    return _this.input_.removeEventListener(evtType, handler, applyPassive());
                } });
            // tslint:enable:object-literal-sort-keys
            return rippleFactory(this.root_, new MDCRippleFoundation(adapter));
        };
        return MDCTextField;
    }(MDCComponent));

    /* node_modules/@smui/floating-label/FloatingLabel.svelte generated by Svelte v3.29.0 */
    const file$p = "node_modules/@smui/floating-label/FloatingLabel.svelte";

    // (9:0) {:else}
    function create_else_block$4(ctx) {
    	let label;
    	let label_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	let label_levels = [
    		{
    			class: label_class_value = "mdc-floating-label " + /*className*/ ctx[1]
    		},
    		/*forId*/ ctx[2] || /*inputProps*/ ctx[6] && /*inputProps*/ ctx[6].id
    		? {
    				"for": /*forId*/ ctx[2] || /*inputProps*/ ctx[6] && /*inputProps*/ ctx[6].id
    			}
    		: {},
    		exclude(/*$$props*/ ctx[7], ["use", "class", "for", "wrapped"])
    	];

    	let label_data = {};

    	for (let i = 0; i < label_levels.length; i += 1) {
    		label_data = assign(label_data, label_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			if (default_slot) default_slot.c();
    			set_attributes(label, label_data);
    			add_location(label, file$p, 9, 2, 225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			/*label_binding*/ ctx[14](label);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, label, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[5].call(null, label))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			set_attributes(label, label_data = get_spread_update(label_levels, [
    				(!current || dirty & /*className*/ 2 && label_class_value !== (label_class_value = "mdc-floating-label " + /*className*/ ctx[1])) && { class: label_class_value },
    				dirty & /*forId*/ 4 && (/*forId*/ ctx[2] || /*inputProps*/ ctx[6] && /*inputProps*/ ctx[6].id
    				? {
    						"for": /*forId*/ ctx[2] || /*inputProps*/ ctx[6] && /*inputProps*/ ctx[6].id
    					}
    				: {}),
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], ["use", "class", "for", "wrapped"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    			/*label_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(9:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if wrapped}
    function create_if_block$9(ctx) {
    	let span;
    	let span_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	let span_levels = [
    		{
    			class: span_class_value = "mdc-floating-label " + /*className*/ ctx[1]
    		},
    		exclude(/*$$props*/ ctx[7], ["use", "class", "wrapped"])
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$p, 1, 2, 16);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[13](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[5].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				(!current || dirty & /*className*/ 2 && span_class_value !== (span_class_value = "mdc-floating-label " + /*className*/ ctx[1])) && { class: span_class_value },
    				dirty & /*$$props*/ 128 && exclude(/*$$props*/ ctx[7], ["use", "class", "wrapped"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(1:0) {#if wrapped}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$9, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*wrapped*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FloatingLabel", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { for: forId = "" } = $$props;
    	let { wrapped = false } = $$props;
    	let element;
    	let floatingLabel;
    	let inputProps = getContext("SMUI:generic:input:props") || {};

    	onMount(() => {
    		floatingLabel = new MDCFloatingLabel(element);
    	});

    	onDestroy(() => {
    		floatingLabel && floatingLabel.destroy();
    	});

    	function shake(shouldShake, ...args) {
    		return floatingLabel.shake(shouldShake, ...args);
    	}

    	function float(shouldFloat, ...args) {
    		return floatingLabel.float(shouldFloat, ...args);
    	}

    	function getWidth(...args) {
    		return floatingLabel.getWidth(...args);
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	function label_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("for" in $$new_props) $$invalidate(2, forId = $$new_props.for);
    		if ("wrapped" in $$new_props) $$invalidate(3, wrapped = $$new_props.wrapped);
    		if ("$$scope" in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCFloatingLabel,
    		onMount,
    		onDestroy,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		forId,
    		wrapped,
    		element,
    		floatingLabel,
    		inputProps,
    		shake,
    		float,
    		getWidth
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("forId" in $$props) $$invalidate(2, forId = $$new_props.forId);
    		if ("wrapped" in $$props) $$invalidate(3, wrapped = $$new_props.wrapped);
    		if ("element" in $$props) $$invalidate(4, element = $$new_props.element);
    		if ("floatingLabel" in $$props) floatingLabel = $$new_props.floatingLabel;
    		if ("inputProps" in $$props) $$invalidate(6, inputProps = $$new_props.inputProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		forId,
    		wrapped,
    		element,
    		forwardEvents,
    		inputProps,
    		$$props,
    		shake,
    		float,
    		getWidth,
    		$$scope,
    		slots,
    		span_binding,
    		label_binding
    	];
    }

    class FloatingLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {
    			use: 0,
    			class: 1,
    			for: 2,
    			wrapped: 3,
    			shake: 8,
    			float: 9,
    			getWidth: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FloatingLabel",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get use() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get for() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set for(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapped() {
    		throw new Error("<FloatingLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapped(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shake() {
    		return this.$$.ctx[8];
    	}

    	set shake(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get float() {
    		return this.$$.ctx[9];
    	}

    	set float(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getWidth() {
    		return this.$$.ctx[10];
    	}

    	set getWidth(value) {
    		throw new Error("<FloatingLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/line-ripple/LineRipple.svelte generated by Svelte v3.29.0 */
    const file$q = "node_modules/@smui/line-ripple/LineRipple.svelte";

    function create_fragment$u(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let mounted;
    	let dispose;

    	let div_levels = [
    		{
    			class: div_class_value = "\n    mdc-line-ripple\n    " + /*className*/ ctx[1] + "\n    " + (/*active*/ ctx[2] ? "mdc-line-ripple--active" : "") + "\n  "
    		},
    		exclude(/*$$props*/ ctx[5], ["use", "class", "active"])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			set_attributes(div, div_data);
    			add_location(div, file$q, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[9](div);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[4].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*className, active*/ 6 && div_class_value !== (div_class_value = "\n    mdc-line-ripple\n    " + /*className*/ ctx[1] + "\n    " + (/*active*/ ctx[2] ? "mdc-line-ripple--active" : "") + "\n  ") && { class: div_class_value },
    				dirty & /*$$props*/ 32 && exclude(/*$$props*/ ctx[5], ["use", "class", "active"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LineRipple", slots, []);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let element;
    	let lineRipple;

    	onMount(() => {
    		lineRipple = new MDCLineRipple(element);
    	});

    	onDestroy(() => {
    		lineRipple && lineRipple.destroy();
    	});

    	function activate(...args) {
    		return lineRipple.activate(...args);
    	}

    	function deactivate(...args) {
    		return lineRipple.deactivate(...args);
    	}

    	function setRippleCenter(xCoordinate, ...args) {
    		return lineRipple.setRippleCenter(xCoordinate, ...args);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(2, active = $$new_props.active);
    	};

    	$$self.$capture_state = () => ({
    		MDCLineRipple,
    		onMount,
    		onDestroy,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		active,
    		element,
    		lineRipple,
    		activate,
    		deactivate,
    		setRippleCenter
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(2, active = $$new_props.active);
    		if ("element" in $$props) $$invalidate(3, element = $$new_props.element);
    		if ("lineRipple" in $$props) lineRipple = $$new_props.lineRipple;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		active,
    		element,
    		forwardEvents,
    		$$props,
    		activate,
    		deactivate,
    		setRippleCenter,
    		div_binding
    	];
    }

    class LineRipple extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			use: 0,
    			class: 1,
    			active: 2,
    			activate: 6,
    			deactivate: 7,
    			setRippleCenter: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineRipple",
    			options,
    			id: create_fragment$u.name
    		});
    	}

    	get use() {
    		throw new Error("<LineRipple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<LineRipple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<LineRipple>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activate() {
    		return this.$$.ctx[6];
    	}

    	set activate(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deactivate() {
    		return this.$$.ctx[7];
    	}

    	set deactivate(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setRippleCenter() {
    		return this.$$.ctx[8];
    	}

    	set setRippleCenter(value) {
    		throw new Error("<LineRipple>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/notched-outline/NotchedOutline.svelte generated by Svelte v3.29.0 */
    const file$r = "node_modules/@smui/notched-outline/NotchedOutline.svelte";

    // (14:2) {#if !noLabel}
    function create_if_block$a(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "mdc-notched-outline__notch");
    			add_location(div, file$r, 14, 4, 367);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(14:2) {#if !noLabel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$v(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let div2_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*noLabel*/ ctx[3] && create_if_block$a(ctx);

    	let div2_levels = [
    		{
    			class: div2_class_value = "\n    mdc-notched-outline\n    " + /*className*/ ctx[1] + "\n    " + (/*notched*/ ctx[2] ? "mdc-notched-outline--notched" : "") + "\n    " + (/*noLabel*/ ctx[3]
    			? "mdc-notched-outline--no-label"
    			: "") + "\n  "
    		},
    		exclude(/*$$props*/ ctx[6], ["use", "class", "notched", "noLabel"])
    	];

    	let div2_data = {};

    	for (let i = 0; i < div2_levels.length; i += 1) {
    		div2_data = assign(div2_data, div2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "mdc-notched-outline__leading");
    			add_location(div0, file$r, 12, 2, 297);
    			attr_dev(div1, "class", "mdc-notched-outline__trailing");
    			add_location(div1, file$r, 16, 2, 437);
    			set_attributes(div2, div2_data);
    			add_location(div2, file$r, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			/*div2_binding*/ ctx[11](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div2, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[5].call(null, div2))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*noLabel*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*noLabel*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			set_attributes(div2, div2_data = get_spread_update(div2_levels, [
    				(!current || dirty & /*className, notched, noLabel*/ 14 && div2_class_value !== (div2_class_value = "\n    mdc-notched-outline\n    " + /*className*/ ctx[1] + "\n    " + (/*notched*/ ctx[2] ? "mdc-notched-outline--notched" : "") + "\n    " + (/*noLabel*/ ctx[3]
    				? "mdc-notched-outline--no-label"
    				: "") + "\n  ")) && { class: div2_class_value },
    				dirty & /*$$props*/ 64 && exclude(/*$$props*/ ctx[6], ["use", "class", "notched", "noLabel"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			/*div2_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotchedOutline", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { notched = false } = $$props;
    	let { noLabel = false } = $$props;
    	let element;
    	let notchedOutline;

    	onMount(() => {
    		notchedOutline = new MDCNotchedOutline(element);
    	});

    	onDestroy(() => {
    		notchedOutline && notchedOutline.destroy();
    	});

    	function notch(notchWidth, ...args) {
    		return notchedOutline.notch(notchWidth, ...args);
    	}

    	function closeNotch(...args) {
    		return notchedOutline.closeNotch(...args);
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("notched" in $$new_props) $$invalidate(2, notched = $$new_props.notched);
    		if ("noLabel" in $$new_props) $$invalidate(3, noLabel = $$new_props.noLabel);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCNotchedOutline,
    		onMount,
    		onDestroy,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		notched,
    		noLabel,
    		element,
    		notchedOutline,
    		notch,
    		closeNotch
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("notched" in $$props) $$invalidate(2, notched = $$new_props.notched);
    		if ("noLabel" in $$props) $$invalidate(3, noLabel = $$new_props.noLabel);
    		if ("element" in $$props) $$invalidate(4, element = $$new_props.element);
    		if ("notchedOutline" in $$props) notchedOutline = $$new_props.notchedOutline;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		notched,
    		noLabel,
    		element,
    		forwardEvents,
    		$$props,
    		notch,
    		closeNotch,
    		$$scope,
    		slots,
    		div2_binding
    	];
    }

    class NotchedOutline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {
    			use: 0,
    			class: 1,
    			notched: 2,
    			noLabel: 3,
    			notch: 7,
    			closeNotch: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotchedOutline",
    			options,
    			id: create_fragment$v.name
    		});
    	}

    	get use() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notched() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notched(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noLabel() {
    		throw new Error("<NotchedOutline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noLabel(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notch() {
    		return this.$$.ctx[7];
    	}

    	set notch(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeNotch() {
    		return this.$$.ctx[8];
    	}

    	set closeNotch(value) {
    		throw new Error("<NotchedOutline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/textfield/Input.svelte generated by Svelte v3.29.0 */
    const file$s = "node_modules/@smui/textfield/Input.svelte";

    function create_fragment$w(ctx) {
    	let input;
    	let input_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let mounted;
    	let dispose;

    	let input_levels = [
    		{
    			class: input_class_value = "mdc-text-field__input " + /*className*/ ctx[1]
    		},
    		{ type: /*type*/ ctx[2] },
    		/*valueProp*/ ctx[4],
    		exclude(/*$$props*/ ctx[8], [
    			"use",
    			"class",
    			"type",
    			"value",
    			"files",
    			"dirty",
    			"invalid",
    			"updateInvalid"
    		])
    	];

    	let input_data = {};

    	for (let i = 0; i < input_levels.length; i += 1) {
    		input_data = assign(input_data, input_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			set_attributes(input, input_data);
    			add_location(input, file$s, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[14](input);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, input, /*use*/ ctx[0])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[5].call(null, input)),
    					listen_dev(input, "change", /*change_handler*/ ctx[15], false, false, false),
    					listen_dev(input, "input", /*input_handler*/ ctx[16], false, false, false),
    					listen_dev(input, "change", /*changeHandler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(input, input_data = get_spread_update(input_levels, [
    				dirty & /*className*/ 2 && input_class_value !== (input_class_value = "mdc-text-field__input " + /*className*/ ctx[1]) && { class: input_class_value },
    				dirty & /*type*/ 4 && { type: /*type*/ ctx[2] },
    				dirty & /*valueProp*/ 16 && /*valueProp*/ ctx[4],
    				dirty & /*$$props*/ 256 && exclude(/*$$props*/ ctx[8], [
    					"use",
    					"class",
    					"type",
    					"value",
    					"files",
    					"dirty",
    					"invalid",
    					"updateInvalid"
    				])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function toNumber(value) {
    	if (value === "") {
    		const nan = new Number(Number.NaN);
    		nan.length = 0;
    		return nan;
    	}

    	return +value;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["change", "input"]);
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { value = "" } = $$props;
    	let { files = undefined } = $$props;
    	let { dirty = false } = $$props;
    	let { invalid = false } = $$props;
    	let { updateInvalid = true } = $$props;
    	let element;
    	let valueProp = {};

    	onMount(() => {
    		if (updateInvalid) {
    			$$invalidate(12, invalid = element.matches(":invalid"));
    		}
    	});

    	function valueUpdater(e) {
    		switch (type) {
    			case "number":
    			case "range":
    				$$invalidate(9, value = toNumber(e.target.value));
    				break;
    			case "file":
    				$$invalidate(10, files = e.target.files);
    			default:
    				$$invalidate(9, value = e.target.value);
    				break;
    		}
    	}

    	function changeHandler(e) {
    		$$invalidate(11, dirty = true);

    		if (updateInvalid) {
    			$$invalidate(12, invalid = element.matches(":invalid"));
    		}
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	const change_handler = e => (type === "file" || type === "range") && valueUpdater(e);
    	const input_handler = e => type !== "file" && valueUpdater(e);

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ("type" in $$new_props) $$invalidate(2, type = $$new_props.type);
    		if ("value" in $$new_props) $$invalidate(9, value = $$new_props.value);
    		if ("files" in $$new_props) $$invalidate(10, files = $$new_props.files);
    		if ("dirty" in $$new_props) $$invalidate(11, dirty = $$new_props.dirty);
    		if ("invalid" in $$new_props) $$invalidate(12, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$new_props) $$invalidate(13, updateInvalid = $$new_props.updateInvalid);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		type,
    		value,
    		files,
    		dirty,
    		invalid,
    		updateInvalid,
    		element,
    		valueProp,
    		toNumber,
    		valueUpdater,
    		changeHandler
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(0, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(1, className = $$new_props.className);
    		if ("type" in $$props) $$invalidate(2, type = $$new_props.type);
    		if ("value" in $$props) $$invalidate(9, value = $$new_props.value);
    		if ("files" in $$props) $$invalidate(10, files = $$new_props.files);
    		if ("dirty" in $$props) $$invalidate(11, dirty = $$new_props.dirty);
    		if ("invalid" in $$props) $$invalidate(12, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$props) $$invalidate(13, updateInvalid = $$new_props.updateInvalid);
    		if ("element" in $$props) $$invalidate(3, element = $$new_props.element);
    		if ("valueProp" in $$props) $$invalidate(4, valueProp = $$new_props.valueProp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, valueProp, value*/ 532) {
    			 if (type === "file") {
    				delete valueProp.value;
    			} else {
    				$$invalidate(4, valueProp.value = value === undefined ? "" : value, valueProp);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		type,
    		element,
    		valueProp,
    		forwardEvents,
    		valueUpdater,
    		changeHandler,
    		$$props,
    		value,
    		files,
    		dirty,
    		invalid,
    		updateInvalid,
    		input_binding,
    		change_handler,
    		input_handler
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {
    			use: 0,
    			class: 1,
    			type: 2,
    			value: 9,
    			files: 10,
    			dirty: 11,
    			invalid: 12,
    			updateInvalid: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$w.name
    		});
    	}

    	get use() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get files() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dirty() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dirty(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateInvalid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateInvalid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/textfield/Textarea.svelte generated by Svelte v3.29.0 */
    const file$t = "node_modules/@smui/textfield/Textarea.svelte";

    function create_fragment$x(ctx) {
    	let textarea;
    	let textarea_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let mounted;
    	let dispose;

    	let textarea_levels = [
    		{
    			class: textarea_class_value = "mdc-text-field__input " + /*className*/ ctx[2]
    		},
    		exclude(/*$$props*/ ctx[6], ["use", "class", "value", "dirty", "invalid", "updateInvalid"])
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			set_attributes(textarea, textarea_data);
    			add_location(textarea, file$t, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			/*textarea_binding*/ ctx[10](textarea);
    			set_input_value(textarea, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, textarea, /*use*/ ctx[1])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[4].call(null, textarea)),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen_dev(textarea, "change", /*changeHandler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
    				dirty & /*className*/ 4 && textarea_class_value !== (textarea_class_value = "mdc-text-field__input " + /*className*/ ctx[2]) && { class: textarea_class_value },
    				dirty & /*$$props*/ 64 && exclude(/*$$props*/ ctx[6], ["use", "class", "value", "dirty", "invalid", "updateInvalid"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Textarea", slots, []);
    	const forwardEvents = forwardEventsBuilder(get_current_component(), ["change", "input"]);
    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { value = "" } = $$props;
    	let { dirty = false } = $$props;
    	let { invalid = false } = $$props;
    	let { updateInvalid = true } = $$props;
    	let element;

    	onMount(() => {
    		if (updateInvalid) {
    			$$invalidate(8, invalid = element.matches(":invalid"));
    		}
    	});

    	function changeHandler() {
    		$$invalidate(7, dirty = true);

    		if (updateInvalid) {
    			$$invalidate(8, invalid = element.matches(":invalid"));
    		}
    	}

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("dirty" in $$new_props) $$invalidate(7, dirty = $$new_props.dirty);
    		if ("invalid" in $$new_props) $$invalidate(8, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$new_props) $$invalidate(9, updateInvalid = $$new_props.updateInvalid);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		value,
    		dirty,
    		invalid,
    		updateInvalid,
    		element,
    		changeHandler
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(2, className = $$new_props.className);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("dirty" in $$props) $$invalidate(7, dirty = $$new_props.dirty);
    		if ("invalid" in $$props) $$invalidate(8, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$props) $$invalidate(9, updateInvalid = $$new_props.updateInvalid);
    		if ("element" in $$props) $$invalidate(3, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		use,
    		className,
    		element,
    		forwardEvents,
    		changeHandler,
    		$$props,
    		dirty,
    		invalid,
    		updateInvalid,
    		textarea_binding,
    		textarea_input_handler
    	];
    }

    class Textarea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {
    			use: 1,
    			class: 2,
    			value: 0,
    			dirty: 7,
    			invalid: 8,
    			updateInvalid: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Textarea",
    			options,
    			id: create_fragment$x.name
    		});
    	}

    	get use() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dirty() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dirty(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateInvalid() {
    		throw new Error("<Textarea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateInvalid(value) {
    		throw new Error("<Textarea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/textfield/Textfield.svelte generated by Svelte v3.29.0 */
    const file$u = "node_modules/@smui/textfield/Textfield.svelte";
    const get_label_slot_changes_1 = dirty => ({});
    const get_label_slot_context_1 = ctx => ({});
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (65:0) {:else}
    function create_else_block_1$1(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[40], null);

    	let div_levels = [
    		{
    			class: div_class_value = "\n      mdc-text-field\n      " + /*className*/ ctx[5] + "\n      " + (/*disabled*/ ctx[7] ? "mdc-text-field--disabled" : "") + "\n      " + (/*fullwidth*/ ctx[8] ? "mdc-text-field--fullwidth" : "") + "\n      " + (/*textarea*/ ctx[9] ? "mdc-text-field--textarea" : "") + "\n      " + (/*variant*/ ctx[10] === "outlined" && !/*fullwidth*/ ctx[8]
    			? "mdc-text-field--outlined"
    			: "") + "\n      " + (/*variant*/ ctx[10] === "standard" && !/*fullwidth*/ ctx[8] && !/*textarea*/ ctx[9]
    			? "smui-text-field--standard"
    			: "") + "\n      " + (/*dense*/ ctx[11] ? "mdc-text-field--dense" : "") + "\n      " + (/*noLabel*/ ctx[14] ? "mdc-text-field--no-label" : "") + "\n      " + (/*withLeadingIcon*/ ctx[12]
    			? "mdc-text-field--with-leading-icon"
    			: "") + "\n      " + (/*withTrailingIcon*/ ctx[13]
    			? "mdc-text-field--with-trailing-icon"
    			: "") + "\n      " + (/*invalid*/ ctx[3] ? "mdc-text-field--invalid" : "") + "\n    "
    		},
    		/*props*/ ctx[19]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$u, 65, 2, 2082);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[39](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[4])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[21].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[40], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*className, disabled, fullwidth, textarea, variant, dense, noLabel, withLeadingIcon, withTrailingIcon, invalid*/ 32680 && div_class_value !== (div_class_value = "\n      mdc-text-field\n      " + /*className*/ ctx[5] + "\n      " + (/*disabled*/ ctx[7] ? "mdc-text-field--disabled" : "") + "\n      " + (/*fullwidth*/ ctx[8] ? "mdc-text-field--fullwidth" : "") + "\n      " + (/*textarea*/ ctx[9] ? "mdc-text-field--textarea" : "") + "\n      " + (/*variant*/ ctx[10] === "outlined" && !/*fullwidth*/ ctx[8]
    				? "mdc-text-field--outlined"
    				: "") + "\n      " + (/*variant*/ ctx[10] === "standard" && !/*fullwidth*/ ctx[8] && !/*textarea*/ ctx[9]
    				? "smui-text-field--standard"
    				: "") + "\n      " + (/*dense*/ ctx[11] ? "mdc-text-field--dense" : "") + "\n      " + (/*noLabel*/ ctx[14] ? "mdc-text-field--no-label" : "") + "\n      " + (/*withLeadingIcon*/ ctx[12]
    				? "mdc-text-field--with-leading-icon"
    				: "") + "\n      " + (/*withTrailingIcon*/ ctx[13]
    				? "mdc-text-field--with-trailing-icon"
    				: "") + "\n      " + (/*invalid*/ ctx[3] ? "mdc-text-field--invalid" : "") + "\n    ")) && { class: div_class_value },
    				dirty[0] & /*props*/ 524288 && /*props*/ ctx[19]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 16) useActions_action.update.call(null, /*use*/ ctx[4]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[39](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(65:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if valued}
    function create_if_block$b(ctx) {
    	let label_1;
    	let t0;
    	let current_block_type_index;
    	let if_block0;
    	let t1;
    	let t2;
    	let label_1_class_value;
    	let useActions_action;
    	let forwardEvents_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[26].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[40], null);
    	const if_block_creators = [create_if_block_6$1, create_else_block$5];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*textarea*/ ctx[9]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = !/*textarea*/ ctx[9] && /*variant*/ ctx[10] !== "outlined" && create_if_block_3$3(ctx);
    	let if_block2 = (/*textarea*/ ctx[9] || /*variant*/ ctx[10] === "outlined" && !/*fullwidth*/ ctx[8]) && create_if_block_1$4(ctx);

    	let label_1_levels = [
    		{
    			class: label_1_class_value = "\n      mdc-text-field\n      " + /*className*/ ctx[5] + "\n      " + (/*disabled*/ ctx[7] ? "mdc-text-field--disabled" : "") + "\n      " + (/*fullwidth*/ ctx[8] ? "mdc-text-field--fullwidth" : "") + "\n      " + (/*textarea*/ ctx[9] ? "mdc-text-field--textarea" : "") + "\n      " + (/*variant*/ ctx[10] === "outlined" && !/*fullwidth*/ ctx[8]
    			? "mdc-text-field--outlined"
    			: "") + "\n      " + (/*variant*/ ctx[10] === "standard" && !/*fullwidth*/ ctx[8] && !/*textarea*/ ctx[9]
    			? "smui-text-field--standard"
    			: "") + "\n      " + (/*dense*/ ctx[11] ? "mdc-text-field--dense" : "") + "\n      " + (/*noLabel*/ ctx[14] || /*label*/ ctx[15] == null
    			? "mdc-text-field--no-label"
    			: "") + "\n      " + (/*withLeadingIcon*/ ctx[12]
    			? "mdc-text-field--with-leading-icon"
    			: "") + "\n      " + (/*withTrailingIcon*/ ctx[13]
    			? "mdc-text-field--with-trailing-icon"
    			: "") + "\n      " + (/*invalid*/ ctx[3] ? "mdc-text-field--invalid" : "") + "\n    "
    		},
    		/*props*/ ctx[19]
    	];

    	let label_1_data = {};

    	for (let i = 0; i < label_1_levels.length; i += 1) {
    		label_1_data = assign(label_1_data, label_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			set_attributes(label_1, label_1_data);
    			add_location(label_1, file$u, 1, 2, 15);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);

    			if (default_slot) {
    				default_slot.m(label_1, null);
    			}

    			append_dev(label_1, t0);
    			if_blocks[current_block_type_index].m(label_1, null);
    			append_dev(label_1, t1);
    			if (if_block1) if_block1.m(label_1, null);
    			append_dev(label_1, t2);
    			if (if_block2) if_block2.m(label_1, null);
    			/*label_1_binding*/ ctx[38](label_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, label_1, /*use*/ ctx[4])),
    					action_destroyer(forwardEvents_action = /*forwardEvents*/ ctx[21].call(null, label_1))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[40], dirty, null, null);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(label_1, t1);
    			}

    			if (!/*textarea*/ ctx[9] && /*variant*/ ctx[10] !== "outlined") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*textarea, variant*/ 1536) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(label_1, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*textarea*/ ctx[9] || /*variant*/ ctx[10] === "outlined" && !/*fullwidth*/ ctx[8]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*textarea, variant, fullwidth*/ 1792) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(label_1, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			set_attributes(label_1, label_1_data = get_spread_update(label_1_levels, [
    				(!current || dirty[0] & /*className, disabled, fullwidth, textarea, variant, dense, noLabel, label, withLeadingIcon, withTrailingIcon, invalid*/ 65448 && label_1_class_value !== (label_1_class_value = "\n      mdc-text-field\n      " + /*className*/ ctx[5] + "\n      " + (/*disabled*/ ctx[7] ? "mdc-text-field--disabled" : "") + "\n      " + (/*fullwidth*/ ctx[8] ? "mdc-text-field--fullwidth" : "") + "\n      " + (/*textarea*/ ctx[9] ? "mdc-text-field--textarea" : "") + "\n      " + (/*variant*/ ctx[10] === "outlined" && !/*fullwidth*/ ctx[8]
    				? "mdc-text-field--outlined"
    				: "") + "\n      " + (/*variant*/ ctx[10] === "standard" && !/*fullwidth*/ ctx[8] && !/*textarea*/ ctx[9]
    				? "smui-text-field--standard"
    				: "") + "\n      " + (/*dense*/ ctx[11] ? "mdc-text-field--dense" : "") + "\n      " + (/*noLabel*/ ctx[14] || /*label*/ ctx[15] == null
    				? "mdc-text-field--no-label"
    				: "") + "\n      " + (/*withLeadingIcon*/ ctx[12]
    				? "mdc-text-field--with-leading-icon"
    				: "") + "\n      " + (/*withTrailingIcon*/ ctx[13]
    				? "mdc-text-field--with-trailing-icon"
    				: "") + "\n      " + (/*invalid*/ ctx[3] ? "mdc-text-field--invalid" : "") + "\n    ")) && { class: label_1_class_value },
    				dirty[0] & /*props*/ 524288 && /*props*/ ctx[19]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 16) useActions_action.update.call(null, /*use*/ ctx[4]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			if (default_slot) default_slot.d(detaching);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			/*label_1_binding*/ ctx[38](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(1:0) {#if valued}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {:else}
    function create_else_block$5(ctx) {
    	let input;
    	let updating_value;
    	let updating_files;
    	let updating_dirty;
    	let updating_invalid;
    	let current;

    	const input_spread_levels = [
    		{ type: /*type*/ ctx[16] },
    		{ disabled: /*disabled*/ ctx[7] },
    		{ updateInvalid: /*updateInvalid*/ ctx[17] },
    		/*fullwidth*/ ctx[8] && /*label*/ ctx[15]
    		? { placeholder: /*label*/ ctx[15] }
    		: {},
    		prefixFilter(/*$$props*/ ctx[22], "input$")
    	];

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[32].call(null, value);
    	}

    	function input_files_binding(value) {
    		/*input_files_binding*/ ctx[33].call(null, value);
    	}

    	function input_dirty_binding(value) {
    		/*input_dirty_binding*/ ctx[34].call(null, value);
    	}

    	function input_invalid_binding(value) {
    		/*input_invalid_binding*/ ctx[35].call(null, value);
    	}

    	let input_props = {};

    	for (let i = 0; i < input_spread_levels.length; i += 1) {
    		input_props = assign(input_props, input_spread_levels[i]);
    	}

    	if (/*value*/ ctx[0] !== void 0) {
    		input_props.value = /*value*/ ctx[0];
    	}

    	if (/*files*/ ctx[1] !== void 0) {
    		input_props.files = /*files*/ ctx[1];
    	}

    	if (/*dirty*/ ctx[2] !== void 0) {
    		input_props.dirty = /*dirty*/ ctx[2];
    	}

    	if (/*invalid*/ ctx[3] !== void 0) {
    		input_props.invalid = /*invalid*/ ctx[3];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));
    	binding_callbacks.push(() => bind(input, "files", input_files_binding));
    	binding_callbacks.push(() => bind(input, "dirty", input_dirty_binding));
    	binding_callbacks.push(() => bind(input, "invalid", input_invalid_binding));
    	input.$on("change", /*change_handler_1*/ ctx[36]);
    	input.$on("input", /*input_handler_1*/ ctx[37]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = (dirty[0] & /*type, disabled, updateInvalid, fullwidth, label, $$props*/ 4424064)
    			? get_spread_update(input_spread_levels, [
    					dirty[0] & /*type*/ 65536 && { type: /*type*/ ctx[16] },
    					dirty[0] & /*disabled*/ 128 && { disabled: /*disabled*/ ctx[7] },
    					dirty[0] & /*updateInvalid*/ 131072 && { updateInvalid: /*updateInvalid*/ ctx[17] },
    					dirty[0] & /*fullwidth, label*/ 33024 && get_spread_object(/*fullwidth*/ ctx[8] && /*label*/ ctx[15]
    					? { placeholder: /*label*/ ctx[15] }
    					: {}),
    					dirty[0] & /*$$props*/ 4194304 && get_spread_object(prefixFilter(/*$$props*/ ctx[22], "input$"))
    				])
    			: {};

    			if (!updating_value && dirty[0] & /*value*/ 1) {
    				updating_value = true;
    				input_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_files && dirty[0] & /*files*/ 2) {
    				updating_files = true;
    				input_changes.files = /*files*/ ctx[1];
    				add_flush_callback(() => updating_files = false);
    			}

    			if (!updating_dirty && dirty[0] & /*dirty*/ 4) {
    				updating_dirty = true;
    				input_changes.dirty = /*dirty*/ ctx[2];
    				add_flush_callback(() => updating_dirty = false);
    			}

    			if (!updating_invalid && dirty[0] & /*invalid*/ 8) {
    				updating_invalid = true;
    				input_changes.invalid = /*invalid*/ ctx[3];
    				add_flush_callback(() => updating_invalid = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(34:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if textarea}
    function create_if_block_6$1(ctx) {
    	let textarea_1;
    	let updating_value;
    	let updating_dirty;
    	let updating_invalid;
    	let current;

    	const textarea_1_spread_levels = [
    		{ disabled: /*disabled*/ ctx[7] },
    		{ updateInvalid: /*updateInvalid*/ ctx[17] },
    		prefixFilter(/*$$props*/ ctx[22], "input$")
    	];

    	function textarea_1_value_binding(value) {
    		/*textarea_1_value_binding*/ ctx[27].call(null, value);
    	}

    	function textarea_1_dirty_binding(value) {
    		/*textarea_1_dirty_binding*/ ctx[28].call(null, value);
    	}

    	function textarea_1_invalid_binding(value) {
    		/*textarea_1_invalid_binding*/ ctx[29].call(null, value);
    	}

    	let textarea_1_props = {};

    	for (let i = 0; i < textarea_1_spread_levels.length; i += 1) {
    		textarea_1_props = assign(textarea_1_props, textarea_1_spread_levels[i]);
    	}

    	if (/*value*/ ctx[0] !== void 0) {
    		textarea_1_props.value = /*value*/ ctx[0];
    	}

    	if (/*dirty*/ ctx[2] !== void 0) {
    		textarea_1_props.dirty = /*dirty*/ ctx[2];
    	}

    	if (/*invalid*/ ctx[3] !== void 0) {
    		textarea_1_props.invalid = /*invalid*/ ctx[3];
    	}

    	textarea_1 = new Textarea({ props: textarea_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textarea_1, "value", textarea_1_value_binding));
    	binding_callbacks.push(() => bind(textarea_1, "dirty", textarea_1_dirty_binding));
    	binding_callbacks.push(() => bind(textarea_1, "invalid", textarea_1_invalid_binding));
    	textarea_1.$on("change", /*change_handler*/ ctx[30]);
    	textarea_1.$on("input", /*input_handler*/ ctx[31]);

    	const block = {
    		c: function create() {
    			create_component(textarea_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textarea_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const textarea_1_changes = (dirty[0] & /*disabled, updateInvalid, $$props*/ 4325504)
    			? get_spread_update(textarea_1_spread_levels, [
    					dirty[0] & /*disabled*/ 128 && { disabled: /*disabled*/ ctx[7] },
    					dirty[0] & /*updateInvalid*/ 131072 && { updateInvalid: /*updateInvalid*/ ctx[17] },
    					dirty[0] & /*$$props*/ 4194304 && get_spread_object(prefixFilter(/*$$props*/ ctx[22], "input$"))
    				])
    			: {};

    			if (!updating_value && dirty[0] & /*value*/ 1) {
    				updating_value = true;
    				textarea_1_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_dirty && dirty[0] & /*dirty*/ 4) {
    				updating_dirty = true;
    				textarea_1_changes.dirty = /*dirty*/ ctx[2];
    				add_flush_callback(() => updating_dirty = false);
    			}

    			if (!updating_invalid && dirty[0] & /*invalid*/ 8) {
    				updating_invalid = true;
    				textarea_1_changes.invalid = /*invalid*/ ctx[3];
    				add_flush_callback(() => updating_invalid = false);
    			}

    			textarea_1.$set(textarea_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textarea_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textarea_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textarea_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(23:4) {#if textarea}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if !textarea && variant !== 'outlined'}
    function create_if_block_3$3(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = !/*noLabel*/ ctx[14] && /*label*/ ctx[15] != null && !/*fullwidth*/ ctx[8] && create_if_block_5$1(ctx);
    	let if_block1 = /*ripple*/ ctx[6] && create_if_block_4$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*noLabel*/ ctx[14] && /*label*/ ctx[15] != null && !/*fullwidth*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*noLabel, label, fullwidth*/ 49408) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*ripple*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*ripple*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(49:4) {#if !textarea && variant !== 'outlined'}",
    		ctx
    	});

    	return block;
    }

    // (50:6) {#if !noLabel && label != null && !fullwidth}
    function create_if_block_5$1(ctx) {
    	let floatinglabel;
    	let current;
    	const floatinglabel_spread_levels = [{ wrapped: true }, prefixFilter(/*$$props*/ ctx[22], "label$")];

    	let floatinglabel_props = {
    		$$slots: { default: [create_default_slot_2$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < floatinglabel_spread_levels.length; i += 1) {
    		floatinglabel_props = assign(floatinglabel_props, floatinglabel_spread_levels[i]);
    	}

    	floatinglabel = new FloatingLabel({
    			props: floatinglabel_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(floatinglabel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(floatinglabel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const floatinglabel_changes = (dirty[0] & /*$$props*/ 4194304)
    			? get_spread_update(floatinglabel_spread_levels, [
    					floatinglabel_spread_levels[0],
    					get_spread_object(prefixFilter(/*$$props*/ ctx[22], "label$"))
    				])
    			: {};

    			if (dirty[0] & /*label*/ 32768 | dirty[1] & /*$$scope*/ 512) {
    				floatinglabel_changes.$$scope = { dirty, ctx };
    			}

    			floatinglabel.$set(floatinglabel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(floatinglabel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(floatinglabel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(floatinglabel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(50:6) {#if !noLabel && label != null && !fullwidth}",
    		ctx
    	});

    	return block;
    }

    // (51:8) <FloatingLabel wrapped {...prefixFilter($$props, 'label$')}>
    function create_default_slot_2$3(ctx) {
    	let t;
    	let current;
    	const label_slot_template = /*#slots*/ ctx[26].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[40], get_label_slot_context);

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[15]);
    			if (label_slot) label_slot.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (label_slot) {
    				label_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*label*/ 32768) set_data_dev(t, /*label*/ ctx[15]);

    			if (label_slot) {
    				if (label_slot.p && dirty[1] & /*$$scope*/ 512) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[40], dirty, get_label_slot_changes, get_label_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (label_slot) label_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$3.name,
    		type: "slot",
    		source: "(51:8) <FloatingLabel wrapped {...prefixFilter($$props, 'label$')}>",
    		ctx
    	});

    	return block;
    }

    // (53:6) {#if ripple}
    function create_if_block_4$2(ctx) {
    	let lineripple;
    	let current;
    	const lineripple_spread_levels = [prefixFilter(/*$$props*/ ctx[22], "ripple$")];
    	let lineripple_props = {};

    	for (let i = 0; i < lineripple_spread_levels.length; i += 1) {
    		lineripple_props = assign(lineripple_props, lineripple_spread_levels[i]);
    	}

    	lineripple = new LineRipple({ props: lineripple_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lineripple.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lineripple, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const lineripple_changes = (dirty[0] & /*$$props*/ 4194304)
    			? get_spread_update(lineripple_spread_levels, [get_spread_object(prefixFilter(/*$$props*/ ctx[22], "ripple$"))])
    			: {};

    			lineripple.$set(lineripple_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lineripple.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lineripple.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lineripple, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(53:6) {#if ripple}",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if textarea || (variant === 'outlined' && !fullwidth)}
    function create_if_block_1$4(ctx) {
    	let notchedoutline;
    	let current;

    	const notchedoutline_spread_levels = [
    		{
    			noLabel: /*noLabel*/ ctx[14] || /*label*/ ctx[15] == null
    		},
    		prefixFilter(/*$$props*/ ctx[22], "outline$")
    	];

    	let notchedoutline_props = {
    		$$slots: { default: [create_default_slot$8] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notchedoutline_spread_levels.length; i += 1) {
    		notchedoutline_props = assign(notchedoutline_props, notchedoutline_spread_levels[i]);
    	}

    	notchedoutline = new NotchedOutline({
    			props: notchedoutline_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notchedoutline.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notchedoutline, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notchedoutline_changes = (dirty[0] & /*noLabel, label, $$props*/ 4243456)
    			? get_spread_update(notchedoutline_spread_levels, [
    					dirty[0] & /*noLabel, label*/ 49152 && {
    						noLabel: /*noLabel*/ ctx[14] || /*label*/ ctx[15] == null
    					},
    					dirty[0] & /*$$props*/ 4194304 && get_spread_object(prefixFilter(/*$$props*/ ctx[22], "outline$"))
    				])
    			: {};

    			if (dirty[0] & /*$$props, label, noLabel*/ 4243456 | dirty[1] & /*$$scope*/ 512) {
    				notchedoutline_changes.$$scope = { dirty, ctx };
    			}

    			notchedoutline.$set(notchedoutline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notchedoutline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notchedoutline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notchedoutline, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(57:4) {#if textarea || (variant === 'outlined' && !fullwidth)}",
    		ctx
    	});

    	return block;
    }

    // (59:8) {#if !noLabel && label != null}
    function create_if_block_2$3(ctx) {
    	let floatinglabel;
    	let current;
    	const floatinglabel_spread_levels = [{ wrapped: true }, prefixFilter(/*$$props*/ ctx[22], "label$")];

    	let floatinglabel_props = {
    		$$slots: { default: [create_default_slot_1$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < floatinglabel_spread_levels.length; i += 1) {
    		floatinglabel_props = assign(floatinglabel_props, floatinglabel_spread_levels[i]);
    	}

    	floatinglabel = new FloatingLabel({
    			props: floatinglabel_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(floatinglabel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(floatinglabel, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const floatinglabel_changes = (dirty[0] & /*$$props*/ 4194304)
    			? get_spread_update(floatinglabel_spread_levels, [
    					floatinglabel_spread_levels[0],
    					get_spread_object(prefixFilter(/*$$props*/ ctx[22], "label$"))
    				])
    			: {};

    			if (dirty[0] & /*label*/ 32768 | dirty[1] & /*$$scope*/ 512) {
    				floatinglabel_changes.$$scope = { dirty, ctx };
    			}

    			floatinglabel.$set(floatinglabel_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(floatinglabel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(floatinglabel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(floatinglabel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(59:8) {#if !noLabel && label != null}",
    		ctx
    	});

    	return block;
    }

    // (60:10) <FloatingLabel wrapped {...prefixFilter($$props, 'label$')}>
    function create_default_slot_1$3(ctx) {
    	let t;
    	let current;
    	const label_slot_template = /*#slots*/ ctx[26].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[40], get_label_slot_context_1);

    	const block = {
    		c: function create() {
    			t = text(/*label*/ ctx[15]);
    			if (label_slot) label_slot.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (label_slot) {
    				label_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*label*/ 32768) set_data_dev(t, /*label*/ ctx[15]);

    			if (label_slot) {
    				if (label_slot.p && dirty[1] & /*$$scope*/ 512) {
    					update_slot(label_slot, label_slot_template, ctx, /*$$scope*/ ctx[40], dirty, get_label_slot_changes_1, get_label_slot_context_1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (label_slot) label_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(60:10) <FloatingLabel wrapped {...prefixFilter($$props, 'label$')}>",
    		ctx
    	});

    	return block;
    }

    // (58:6) <NotchedOutline noLabel={noLabel || label == null} {...prefixFilter($$props, 'outline$')}>
    function create_default_slot$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*noLabel*/ ctx[14] && /*label*/ ctx[15] != null && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*noLabel*/ ctx[14] && /*label*/ ctx[15] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*noLabel, label*/ 49152) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(58:6) <NotchedOutline noLabel={noLabel || label == null} {...prefixFilter($$props, 'outline$')}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$b, create_else_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*valued*/ ctx[20]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Textfield", slots, ['default','label']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	let uninitializedValue = () => {
    		
    	};

    	let { use = [] } = $$props;
    	let { class: className = "" } = $$props;
    	let { ripple = true } = $$props;
    	let { disabled = false } = $$props;
    	let { fullwidth = false } = $$props;
    	let { textarea = false } = $$props;
    	let { variant = "standard" } = $$props;
    	let { dense = false } = $$props;
    	let { withLeadingIcon = false } = $$props;
    	let { withTrailingIcon = false } = $$props;
    	let { noLabel = false } = $$props;
    	let { label = null } = $$props;
    	let { type = "text" } = $$props;
    	let { value = uninitializedValue } = $$props;
    	let { files = uninitializedValue } = $$props;
    	let { dirty = false } = $$props;
    	let { invalid = uninitializedValue } = $$props;
    	let { updateInvalid = invalid === uninitializedValue } = $$props;
    	let { useNativeValidation = updateInvalid } = $$props;
    	let element;
    	let textField;
    	let addLayoutListener = getContext("SMUI:addLayoutListener");
    	let removeLayoutListener;

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(() => {
    		$$invalidate(41, textField = new MDCTextField(element));

    		if (!ripple) {
    			textField.ripple && textField.ripple.destroy();
    		}
    	});

    	onDestroy(() => {
    		textField && textField.destroy();

    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function focus(...args) {
    		return textField.focus(...args);
    	}

    	function layout(...args) {
    		return textField.layout(...args);
    	}

    	function textarea_1_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function textarea_1_dirty_binding(value) {
    		dirty = value;
    		$$invalidate(2, dirty);
    	}

    	function textarea_1_invalid_binding(value$1) {
    		invalid = value$1;
    		(((((($$invalidate(3, invalid), $$invalidate(41, textField)), $$invalidate(17, updateInvalid)), $$invalidate(0, value)), $$invalidate(43, uninitializedValue)), $$invalidate(7, disabled)), $$invalidate(23, useNativeValidation));
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function input_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function input_files_binding(value) {
    		files = value;
    		$$invalidate(1, files);
    	}

    	function input_dirty_binding(value) {
    		dirty = value;
    		$$invalidate(2, dirty);
    	}

    	function input_invalid_binding(value$1) {
    		invalid = value$1;
    		(((((($$invalidate(3, invalid), $$invalidate(41, textField)), $$invalidate(17, updateInvalid)), $$invalidate(0, value)), $$invalidate(43, uninitializedValue)), $$invalidate(7, disabled)), $$invalidate(23, useNativeValidation));
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function input_handler_1(event) {
    		bubble($$self, event);
    	}

    	function label_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(18, element);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(18, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(22, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("use" in $$new_props) $$invalidate(4, use = $$new_props.use);
    		if ("class" in $$new_props) $$invalidate(5, className = $$new_props.class);
    		if ("ripple" in $$new_props) $$invalidate(6, ripple = $$new_props.ripple);
    		if ("disabled" in $$new_props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ("fullwidth" in $$new_props) $$invalidate(8, fullwidth = $$new_props.fullwidth);
    		if ("textarea" in $$new_props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("variant" in $$new_props) $$invalidate(10, variant = $$new_props.variant);
    		if ("dense" in $$new_props) $$invalidate(11, dense = $$new_props.dense);
    		if ("withLeadingIcon" in $$new_props) $$invalidate(12, withLeadingIcon = $$new_props.withLeadingIcon);
    		if ("withTrailingIcon" in $$new_props) $$invalidate(13, withTrailingIcon = $$new_props.withTrailingIcon);
    		if ("noLabel" in $$new_props) $$invalidate(14, noLabel = $$new_props.noLabel);
    		if ("label" in $$new_props) $$invalidate(15, label = $$new_props.label);
    		if ("type" in $$new_props) $$invalidate(16, type = $$new_props.type);
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("files" in $$new_props) $$invalidate(1, files = $$new_props.files);
    		if ("dirty" in $$new_props) $$invalidate(2, dirty = $$new_props.dirty);
    		if ("invalid" in $$new_props) $$invalidate(3, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$new_props) $$invalidate(17, updateInvalid = $$new_props.updateInvalid);
    		if ("useNativeValidation" in $$new_props) $$invalidate(23, useNativeValidation = $$new_props.useNativeValidation);
    		if ("$$scope" in $$new_props) $$invalidate(40, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTextField,
    		onMount,
    		onDestroy,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		exclude,
    		prefixFilter,
    		useActions,
    		FloatingLabel,
    		LineRipple,
    		NotchedOutline,
    		Input,
    		Textarea,
    		forwardEvents,
    		uninitializedValue,
    		use,
    		className,
    		ripple,
    		disabled,
    		fullwidth,
    		textarea,
    		variant,
    		dense,
    		withLeadingIcon,
    		withTrailingIcon,
    		noLabel,
    		label,
    		type,
    		value,
    		files,
    		dirty,
    		invalid,
    		updateInvalid,
    		useNativeValidation,
    		element,
    		textField,
    		addLayoutListener,
    		removeLayoutListener,
    		focus,
    		layout,
    		props,
    		valued
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(22, $$props = assign(assign({}, $$props), $$new_props));
    		if ("uninitializedValue" in $$props) $$invalidate(43, uninitializedValue = $$new_props.uninitializedValue);
    		if ("use" in $$props) $$invalidate(4, use = $$new_props.use);
    		if ("className" in $$props) $$invalidate(5, className = $$new_props.className);
    		if ("ripple" in $$props) $$invalidate(6, ripple = $$new_props.ripple);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$new_props.disabled);
    		if ("fullwidth" in $$props) $$invalidate(8, fullwidth = $$new_props.fullwidth);
    		if ("textarea" in $$props) $$invalidate(9, textarea = $$new_props.textarea);
    		if ("variant" in $$props) $$invalidate(10, variant = $$new_props.variant);
    		if ("dense" in $$props) $$invalidate(11, dense = $$new_props.dense);
    		if ("withLeadingIcon" in $$props) $$invalidate(12, withLeadingIcon = $$new_props.withLeadingIcon);
    		if ("withTrailingIcon" in $$props) $$invalidate(13, withTrailingIcon = $$new_props.withTrailingIcon);
    		if ("noLabel" in $$props) $$invalidate(14, noLabel = $$new_props.noLabel);
    		if ("label" in $$props) $$invalidate(15, label = $$new_props.label);
    		if ("type" in $$props) $$invalidate(16, type = $$new_props.type);
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("files" in $$props) $$invalidate(1, files = $$new_props.files);
    		if ("dirty" in $$props) $$invalidate(2, dirty = $$new_props.dirty);
    		if ("invalid" in $$props) $$invalidate(3, invalid = $$new_props.invalid);
    		if ("updateInvalid" in $$props) $$invalidate(17, updateInvalid = $$new_props.updateInvalid);
    		if ("useNativeValidation" in $$props) $$invalidate(23, useNativeValidation = $$new_props.useNativeValidation);
    		if ("element" in $$props) $$invalidate(18, element = $$new_props.element);
    		if ("textField" in $$props) $$invalidate(41, textField = $$new_props.textField);
    		if ("addLayoutListener" in $$props) addLayoutListener = $$new_props.addLayoutListener;
    		if ("removeLayoutListener" in $$props) removeLayoutListener = $$new_props.removeLayoutListener;
    		if ("props" in $$props) $$invalidate(19, props = $$new_props.props);
    		if ("valued" in $$props) $$invalidate(20, valued = $$new_props.valued);
    	};

    	let props;
    	let valued;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(19, props = exclude($$props, [
    			"use",
    			"class",
    			"ripple",
    			"disabled",
    			"fullwidth",
    			"textarea",
    			"variant",
    			"dense",
    			"withLeadingIcon",
    			"withTrailingIcon",
    			"noLabel",
    			"label",
    			"type",
    			"value",
    			"dirty",
    			"invalid",
    			"updateInvalid",
    			"useNativeValidation",
    			"input$",
    			"label$",
    			"ripple$",
    			"outline$"
    		]));

    		if ($$self.$$.dirty[0] & /*value, files*/ 3) {
    			 $$invalidate(20, valued = value !== uninitializedValue || files !== uninitializedValue);
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1 | $$self.$$.dirty[1] & /*textField*/ 1024) {
    			 if (textField && value !== uninitializedValue && textField.value !== value) {
    				$$invalidate(41, textField.value = value, textField);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*disabled*/ 128 | $$self.$$.dirty[1] & /*textField*/ 1024) {
    			 if (textField && textField.disabled !== disabled) {
    				$$invalidate(41, textField.disabled = disabled, textField);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*invalid, updateInvalid*/ 131080 | $$self.$$.dirty[1] & /*textField*/ 1024) {
    			 if (textField && textField.valid !== !invalid) {
    				if (updateInvalid) {
    					$$invalidate(3, invalid = !textField.valid);
    				} else {
    					$$invalidate(41, textField.valid = !invalid, textField);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*useNativeValidation*/ 8388608 | $$self.$$.dirty[1] & /*textField*/ 1024) {
    			 if (textField && textField.useNativeValidation !== useNativeValidation) {
    				$$invalidate(41, textField.useNativeValidation = useNativeValidation, textField);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		files,
    		dirty,
    		invalid,
    		use,
    		className,
    		ripple,
    		disabled,
    		fullwidth,
    		textarea,
    		variant,
    		dense,
    		withLeadingIcon,
    		withTrailingIcon,
    		noLabel,
    		label,
    		type,
    		updateInvalid,
    		element,
    		props,
    		valued,
    		forwardEvents,
    		$$props,
    		useNativeValidation,
    		focus,
    		layout,
    		slots,
    		textarea_1_value_binding,
    		textarea_1_dirty_binding,
    		textarea_1_invalid_binding,
    		change_handler,
    		input_handler,
    		input_value_binding,
    		input_files_binding,
    		input_dirty_binding,
    		input_invalid_binding,
    		change_handler_1,
    		input_handler_1,
    		label_1_binding,
    		div_binding,
    		$$scope
    	];
    }

    class Textfield extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$y,
    			create_fragment$y,
    			safe_not_equal,
    			{
    				use: 4,
    				class: 5,
    				ripple: 6,
    				disabled: 7,
    				fullwidth: 8,
    				textarea: 9,
    				variant: 10,
    				dense: 11,
    				withLeadingIcon: 12,
    				withTrailingIcon: 13,
    				noLabel: 14,
    				label: 15,
    				type: 16,
    				value: 0,
    				files: 1,
    				dirty: 2,
    				invalid: 3,
    				updateInvalid: 17,
    				useNativeValidation: 23,
    				focus: 24,
    				layout: 25
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Textfield",
    			options,
    			id: create_fragment$y.name
    		});
    	}

    	get use() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullwidth() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullwidth(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textarea() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textarea(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withLeadingIcon() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withLeadingIcon(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get withTrailingIcon() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set withTrailingIcon(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noLabel() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noLabel(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get files() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set files(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dirty() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dirty(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateInvalid() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateInvalid(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useNativeValidation() {
    		throw new Error("<Textfield>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useNativeValidation(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		return this.$$.ctx[24];
    	}

    	set focus(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx[25];
    	}

    	set layout(value) {
    		throw new Error("<Textfield>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/terminal.svelte generated by Svelte v3.29.0 */

    const { console: console_1$4 } = globals;
    const file$v = "src/pages/terminal.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (78:0) <Card padded>
    function create_default_slot_1$4(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let h3;
    	let t5;
    	let div;
    	let p1;
    	let t7;
    	let p2;
    	let t9;
    	let p3;
    	let t11;
    	let p4;
    	let t13;
    	let p5;
    	let t15;
    	let p6;
    	let t17;
    	let p7;
    	let t19;
    	let p8;
    	let t21;
    	let p9;
    	let t23;
    	let p10;
    	let t25;
    	let p11;
    	let t27;
    	let p12;
    	let t29;
    	let p13;
    	let t31;
    	let p14;
    	let t33;
    	let p15;
    	let t35;
    	let p16;
    	let t37;
    	let p17;
    	let t39;
    	let p18;
    	let t41;
    	let h4;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Terminal Challenge";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "This is a game where you must follow the instructions to become familiar with using the terminal. This isn't a real terminal so no using \"*\". If you succesfully complete a challenge you get a point. If you make a mistake you lose a point.";
    			t3 = space();
    			h3 = element("h3");
    			h3.textContent = "Here are some common commands to help you out.";
    			t5 = space();
    			div = element("div");
    			p1 = element("p");
    			p1.textContent = "1.\t\n            cat filename -\n            Displays a filename";
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "2.\t\n            cd dirname -\n            Moves you to the identified directory";
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "3.\t\n            cp file1 file2 -\n            Copies one file/directory to the specified location";
    			t11 = space();
    			p4 = element("p");
    			p4.textContent = "4.\t\n            file filename -\n            Identifies the file type (binary, text, etc)";
    			t13 = space();
    			p5 = element("p");
    			p5.textContent = "5.\t\n            find filename dir -\n            Finds a file/directory";
    			t15 = space();
    			p6 = element("p");
    			p6.textContent = "6.\t\n            head filename -\n            Shows the beginning of a file";
    			t17 = space();
    			p7 = element("p");
    			p7.textContent = "7.\t\n            less filename -\n            Browses through a file from the end or the beginning";
    			t19 = space();
    			p8 = element("p");
    			p8.textContent = "8.\t\n            ls dirname -\n            Shows the contents of the directory specified";
    			t21 = space();
    			p9 = element("p");
    			p9.textContent = "9.\t\n            mkdir dirname -\n            Creates the specified directory";
    			t23 = space();
    			p10 = element("p");
    			p10.textContent = "10.\t\n            more filename -\n            Browses through a file from the beginning to the end";
    			t25 = space();
    			p11 = element("p");
    			p11.textContent = "11.\n            mv file1 file2 -\n            Moves the location of, or renames a file/directory";
    			t27 = space();
    			p12 = element("p");
    			p12.textContent = "12.\t\n            pwd -\n            Shows the current directory the user is in";
    			t29 = space();
    			p13 = element("p");
    			p13.textContent = "13.\n            rm filename -\n            Removes a file";
    			t31 = space();
    			p14 = element("p");
    			p14.textContent = "14.\t\n            rmdir dirname -\n            Removes a directory -";
    			t33 = space();
    			p15 = element("p");
    			p15.textContent = "15.\t\n            tail filename -\n            Shows the end of a file";
    			t35 = space();
    			p16 = element("p");
    			p16.textContent = "16.\t\n            touch filename -\n            Creates a blank file or modifies an existing file or its attributes";
    			t37 = space();
    			p17 = element("p");
    			p17.textContent = "17.\t\n            whereis filename -\n            Shows the location of a file";
    			t39 = space();
    			p18 = element("p");
    			p18.textContent = "18.\t\n            which filename -\n            Shows the location of a file if it is in your PATH";
    			t41 = space();
    			h4 = element("h4");
    			h4.textContent = "Type in the requested command and hit enter or click the button to play.";
    			attr_dev(h1, "class", "svelte-1xeb54i");
    			add_location(h1, file$v, 78, 4, 2202);
    			attr_dev(p0, "class", "svelte-1xeb54i");
    			add_location(p0, file$v, 79, 4, 2234);
    			attr_dev(h3, "class", "svelte-1xeb54i");
    			add_location(h3, file$v, 83, 4, 2499);
    			attr_dev(p1, "class", "svelte-1xeb54i");
    			add_location(p1, file$v, 85, 8, 2573);
    			attr_dev(p2, "class", "svelte-1xeb54i");
    			add_location(p2, file$v, 90, 8, 2673);
    			attr_dev(p3, "class", "svelte-1xeb54i");
    			add_location(p3, file$v, 95, 8, 2789);
    			attr_dev(p4, "class", "svelte-1xeb54i");
    			add_location(p4, file$v, 100, 8, 2923);
    			attr_dev(p5, "class", "svelte-1xeb54i");
    			add_location(p5, file$v, 105, 8, 3049);
    			attr_dev(p6, "class", "svelte-1xeb54i");
    			add_location(p6, file$v, 110, 8, 3157);
    			attr_dev(p7, "class", "svelte-1xeb54i");
    			add_location(p7, file$v, 115, 8, 3268);
    			attr_dev(p8, "class", "svelte-1xeb54i");
    			add_location(p8, file$v, 120, 8, 3402);
    			attr_dev(p9, "class", "svelte-1xeb54i");
    			add_location(p9, file$v, 125, 8, 3526);
    			attr_dev(p10, "class", "svelte-1xeb54i");
    			add_location(p10, file$v, 130, 8, 3639);
    			attr_dev(p11, "class", "svelte-1xeb54i");
    			add_location(p11, file$v, 135, 8, 3774);
    			attr_dev(p12, "class", "svelte-1xeb54i");
    			add_location(p12, file$v, 140, 8, 3907);
    			attr_dev(p13, "class", "svelte-1xeb54i");
    			add_location(p13, file$v, 145, 8, 4022);
    			attr_dev(p14, "class", "svelte-1xeb54i");
    			add_location(p14, file$v, 150, 8, 4116);
    			attr_dev(p15, "class", "svelte-1xeb54i");
    			add_location(p15, file$v, 155, 8, 4220);
    			attr_dev(p16, "class", "svelte-1xeb54i");
    			add_location(p16, file$v, 160, 8, 4326);
    			attr_dev(p17, "class", "svelte-1xeb54i");
    			add_location(p17, file$v, 165, 8, 4477);
    			attr_dev(p18, "class", "svelte-1xeb54i");
    			add_location(p18, file$v, 170, 8, 4591);
    			add_location(div, file$v, 84, 4, 2559);
    			attr_dev(h4, "class", "svelte-1xeb54i");
    			add_location(h4, file$v, 177, 4, 4733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p1);
    			append_dev(div, t7);
    			append_dev(div, p2);
    			append_dev(div, t9);
    			append_dev(div, p3);
    			append_dev(div, t11);
    			append_dev(div, p4);
    			append_dev(div, t13);
    			append_dev(div, p5);
    			append_dev(div, t15);
    			append_dev(div, p6);
    			append_dev(div, t17);
    			append_dev(div, p7);
    			append_dev(div, t19);
    			append_dev(div, p8);
    			append_dev(div, t21);
    			append_dev(div, p9);
    			append_dev(div, t23);
    			append_dev(div, p10);
    			append_dev(div, t25);
    			append_dev(div, p11);
    			append_dev(div, t27);
    			append_dev(div, p12);
    			append_dev(div, t29);
    			append_dev(div, p13);
    			append_dev(div, t31);
    			append_dev(div, p14);
    			append_dev(div, t33);
    			append_dev(div, p15);
    			append_dev(div, t35);
    			append_dev(div, p16);
    			append_dev(div, t37);
    			append_dev(div, p17);
    			append_dev(div, t39);
    			append_dev(div, p18);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, h4, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$4.name,
    		type: "slot",
    		source: "(78:0) <Card padded>",
    		ctx
    	});

    	return block;
    }

    // (186:42) 
    function create_if_block_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("try again.");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(186:42) ",
    		ctx
    	});

    	return block;
    }

    // (184:12) {#if show[question.id]}
    function create_if_block$c(ctx) {
    	let p;
    	let t_value = /*question*/ ctx[13].msg + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "terminal svelte-1xeb54i");
    			add_location(p, file$v, 184, 20, 4996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(184:12) {#if show[question.id]}",
    		ctx
    	});

    	return block;
    }

    // (183:8) {#each questions as question (question.id)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*show*/ ctx[3][/*question*/ ctx[13].id]) return create_if_block$c;
    		if (/*toggle*/ ctx[2][/*question*/ ctx[13].id]) return create_if_block_1$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(183:8) {#each questions as question (question.id)}",
    		ctx
    	});

    	return block;
    }

    // (181:0) <Paper elevation={4}>
    function create_default_slot$9(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let form;
    	let t1_value = /*prompt*/ ctx[4][/*counter*/ ctx[0]] + "";
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;
    	let each_value = /*questions*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*question*/ ctx[13].id;
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			form = element("form");
    			t1 = text(t1_value);
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			attr_dev(input0, "class", "grn-border svelte-1xeb54i");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter commands here");
    			add_location(input0, file$v, 191, 29, 5260);
    			attr_dev(input1, "class", "grn-border svelte-1xeb54i");
    			attr_dev(input1, "type", "submit");
    			input1.value = "Enter";
    			add_location(input1, file$v, 192, 12, 5365);
    			add_location(form, file$v, 190, 8, 5156);
    			attr_dev(div, "class", "terminal grn-border svelte-1xeb54i");
    			add_location(div, file$v, 181, 4, 4854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, form);
    			append_dev(form, t1);
    			append_dev(form, input0);
    			set_input_value(input0, /*input*/ ctx[1]);
    			append_dev(form, t2);
    			append_dev(form, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[8]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*questions, show, toggle*/ 44) {
    				const each_value = /*questions*/ ctx[5];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$4, t0, get_each_context$4);
    			}

    			if (dirty & /*counter*/ 1 && t1_value !== (t1_value = /*prompt*/ ctx[4][/*counter*/ ctx[0]] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*input*/ 2 && input0.value !== /*input*/ ctx[1]) {
    				set_input_value(input0, /*input*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(181:0) <Paper elevation={4}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$z(ctx) {
    	let main;
    	let card;
    	let t0;
    	let br;
    	let t1;
    	let paper;
    	let current;

    	card = new Card({
    			props: {
    				padded: true,
    				$$slots: { default: [create_default_slot_1$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	paper = new Paper({
    			props: {
    				elevation: 4,
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(card.$$.fragment);
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			create_component(paper.$$.fragment);
    			add_location(br, file$v, 179, 0, 4823);
    			attr_dev(main, "class", "svelte-1xeb54i");
    			add_location(main, file$v, 76, 0, 2177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(card, main, null);
    			append_dev(main, t0);
    			append_dev(main, br);
    			append_dev(main, t1);
    			mount_component(paper, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    			const paper_changes = {};

    			if (dirty & /*$$scope, input, counter, show, toggle*/ 65551) {
    				paper_changes.$$scope = { dirty, ctx };
    			}

    			paper.$set(paper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			transition_in(paper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			transition_out(paper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(card);
    			destroy_component(paper);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(9, $count = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Terminal", slots, []);
    	let prompt = ["~%", "~%", "/Users ~%", "~%", "stuff ~%", "~%", "~%", "~%", "~%", "~%", "~%"];
    	let counter = 0;
    	let input;

    	let answer = [
    		"pwd",
    		"ls",
    		"cd ..",
    		"clear",
    		"cd guest/stuff",
    		"touch file.txt",
    		"mkdir things",
    		"cat file",
    		"cp file doc",
    		"rm file"
    	];

    	const toggle = [];
    	const show = [true];

    	const questions = [
    		{ msg: "Print working directory", id: 0 },
    		{
    			msg: "/Users/guest -now list the directories contents",
    			id: 1
    		},
    		{
    			msg: "Documents stuff journal.txt -now move up a level in the directory",
    			id: 2
    		},
    		{
    			msg: "/Users -now clear the screen",
    			id: 3
    		},
    		{
    			msg: "-now navigate to stuff in one command (hint: its inside the guest directory",
    			id: 4
    		},
    		{
    			msg: "-now create a text file named file",
    			id: 5
    		},
    		{
    			msg: "-now create the directory things",
    			id: 6
    		},
    		{
    			msg: "-now display the contents of file",
    			id: 7
    		},
    		{
    			msg: "How did any text get in Here? Now copy file to doc",
    			id: 8
    		},
    		{ msg: "remove file", id: 9 },
    		{
    			msg: "You completed all the tasks",
    			id: 10
    		}
    	];

    	let rand = () => Math.floor(Math.random() * questions.length);

    	let play = (guess, questionNum) => {
    		clear(guess);

    		guess === answer[questionNum]
    		? $$invalidate(3, show[questionNum + 1] = true, show)
    		: $$invalidate(2, toggle[questionNum] = true, toggle);

    		$$invalidate(1, input = "");

    		if (show[questionNum + 1]) {
    			$$invalidate(0, counter++, counter);
    			set_store_value(count, $count++, $count);
    		}

    		console.log(counter);
    	};

    	let clear = guess => guess === "clear" && show.forEach((el, index) => $$invalidate(3, show[index] = false, show));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<Terminal> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		input = this.value;
    		$$invalidate(1, input);
    	}

    	const submit_handler = () => play(input.toLowerCase(), counter);

    	$$self.$capture_state = () => ({
    		Textfield,
    		Card,
    		Button: Button_1,
    		Paper,
    		Title,
    		Subtitle,
    		Content,
    		count,
    		prompt,
    		counter,
    		input,
    		answer,
    		toggle,
    		show,
    		questions,
    		rand,
    		play,
    		clear,
    		$count
    	});

    	$$self.$inject_state = $$props => {
    		if ("prompt" in $$props) $$invalidate(4, prompt = $$props.prompt);
    		if ("counter" in $$props) $$invalidate(0, counter = $$props.counter);
    		if ("input" in $$props) $$invalidate(1, input = $$props.input);
    		if ("answer" in $$props) answer = $$props.answer;
    		if ("rand" in $$props) rand = $$props.rand;
    		if ("play" in $$props) $$invalidate(6, play = $$props.play);
    		if ("clear" in $$props) clear = $$props.clear;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*counter, toggle, $count*/ 517) {
    			 if (counter < 8 && toggle[counter]) set_store_value(count, $count--, $count);
    		}
    	};

    	return [
    		counter,
    		input,
    		toggle,
    		show,
    		prompt,
    		questions,
    		play,
    		input0_input_handler,
    		submit_handler
    	];
    }

    class Terminal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Terminal",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src/pages/ttt.svelte generated by Svelte v3.29.0 */

    const { console: console_1$5 } = globals;
    const file$w = "src/pages/ttt.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (102:27) 
    function create_if_block_3$4(ctx) {
    	let h3;
    	let h3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "It's a tie!";
    			add_location(h3, file$w, 102, 2, 3094);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h3_transition) h3_transition = create_bidirectional_transition(h3, fly, { y: -100, duration: 2000 }, true);
    				h3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h3_transition) h3_transition = create_bidirectional_transition(h3, fly, { y: -100, duration: 2000 }, false);
    			h3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching && h3_transition) h3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(102:27) ",
    		ctx
    	});

    	return block;
    }

    // (99:29) 
    function create_if_block_2$4(ctx) {
    	let p;
    	let t1;
    	let h3;
    	let h3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "You lost a point.";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "The computer won.";
    			add_location(p, file$w, 99, 8, 2963);
    			add_location(h3, file$w, 100, 2, 2990);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h3_transition) h3_transition = create_bidirectional_transition(h3, fly, { y: -100, duration: 2000 }, true);
    				h3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h3_transition) h3_transition = create_bidirectional_transition(h3, fly, { y: -100, duration: 2000 }, false);
    			h3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching && h3_transition) h3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(99:29) ",
    		ctx
    	});

    	return block;
    }

    // (96:4) {#if winner === 'O'}
    function create_if_block_1$6(ctx) {
    	let p;
    	let t1;
    	let h3;
    	let h3_intro;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "You got a point.";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "Congratulations, you won!";
    			add_location(p, file$w, 96, 8, 2835);
    			add_location(h3, file$w, 97, 2, 2861);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    		},
    		i: function intro(local) {
    			if (!h3_intro) {
    				add_render_callback(() => {
    					h3_intro = create_in_transition(h3, /*spin*/ ctx[5], { duration: 6000 });
    					h3_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(96:4) {#if winner === 'O'}",
    		ctx
    	});

    	return block;
    }

    // (108:4) {#if square}
    function create_if_block$d(ctx) {
    	let p;
    	let t_value = /*square*/ ctx[21] + "";
    	let t;
    	let p_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$w, 108, 4, 3376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(p, "introstart", /*introstart_handler*/ ctx[10], false, false, false),
    					listen_dev(p, "introend", /*introend_handler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*grid*/ 1) && t_value !== (t_value = /*square*/ ctx[21] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!p_transition) p_transition = create_bidirectional_transition(p, fade, {}, true);
    				p_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!p_transition) p_transition = create_bidirectional_transition(p, fade, {}, false);
    			p_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching && p_transition) p_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(108:4) {#if square}",
    		ctx
    	});

    	return block;
    }

    // (106:2) {#each grid as square, i (i)}
    function create_each_block$5(key_1, ctx) {
    	let div;
    	let t;
    	let div_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*square*/ ctx[21] && create_if_block$d(ctx);

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[12](/*i*/ ctx[23], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(div, "id", div_id_value = /*i*/ ctx[23]);
    			attr_dev(div, "class", "grid-item svelte-1pv83b0");
    			add_location(div, file$w, 106, 3, 3235);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(div, "mouseup", /*mouseup_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*square*/ ctx[21]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*grid*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$d(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*grid*/ 1 && div_id_value !== (div_id_value = /*i*/ ctx[23])) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(106:2) {#each grid as square, i (i)}",
    		ctx
    	});

    	return block;
    }

    // (118:1) <Button on:click={() => reset()} variant="raised">
    function create_default_slot$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reset The Game");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(118:1) <Button on:click={() => reset()} variant=\\\"raised\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t3;
    	let button;
    	let main_transition;
    	let current;
    	const if_block_creators = [create_if_block_1$6, create_if_block_2$4, create_if_block_3$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*winner*/ ctx[1] === "O") return 0;
    		if (/*winner*/ ctx[1] === "X") return 1;
    		if (/*totalCount*/ ctx[3] >= 9) return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	let each_value = /*grid*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*i*/ ctx[23];
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	button = new Button_1({
    			props: {
    				variant: "raised",
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Welcome to Tic Tac Toe!";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			create_component(button.$$.fragment);
    			attr_dev(h1, "class", "svelte-1pv83b0");
    			add_location(h1, file$w, 94, 1, 2769);
    			attr_dev(div, "class", "grid-container svelte-1pv83b0");
    			add_location(div, file$w, 104, 1, 3170);
    			attr_dev(main, "class", "svelte-1pv83b0");
    			add_location(main, file$w, 93, 0, 2669);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			append_dev(main, t2);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(main, t3);
    			mount_component(button, main, null);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, t2);
    				} else {
    					if_block = null;
    				}
    			}

    			if (dirty & /*grid, uCanPlay, play, pcCanPLay, computer, blocked*/ 965) {
    				const each_value = /*grid*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}

    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16777216) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button.$$.fragment, local);

    			add_render_callback(() => {
    				if (!main_transition) main_transition = create_bidirectional_transition(
    					main,
    					scale,
    					{
    						duration: 1000,
    						delay: 200,
    						opacity: 0.5,
    						start: 0,
    						easing: quintOut
    					},
    					true
    				);

    				main_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button.$$.fragment, local);

    			if (!main_transition) main_transition = create_bidirectional_transition(
    				main,
    				scale,
    				{
    					duration: 1000,
    					delay: 200,
    					opacity: 0.5,
    					start: 0,
    					easing: quintOut
    				},
    				false
    			);

    			main_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(button);
    			if (detaching && main_transition) main_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let $count;
    	validate_store(count, "count");
    	component_subscribe($$self, count, $$value => $$invalidate(18, $count = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ttt", slots, []);
    	let grid = ["", "", "", "", "", "", "", "", ""];
    	let winner;
    	let turnCount = 0;
    	let pcTurnCount = 0;
    	let success = false;
    	let blocked = false;

    	const reset = () => {
    		$$invalidate(0, grid = ["", "", "", "", "", "", "", "", ""]);
    		$$invalidate(1, winner = undefined);
    		$$invalidate(15, turnCount = 0);
    		$$invalidate(16, pcTurnCount = 0);
    	};

    	function spin(node, { duration }) {
    		return {
    			duration,
    			css: t => {
    				const eased = elasticOut(t);

    				return `
					transform: scale(${eased}) rotate(${eased * 720}deg);
					color: hsl(
						${~~(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`;
    			}
    		};
    	}

    	//winning conditions Across rows	
    	function winA(player) {
    		for (let i = 0; i < 7; i += 3) {
    			// i is 0 then 3 then 6
    			if (grid[i] === player && grid[i + 1] === player && grid[i + 2] === player) {
    				// covers 0,1,2/ 3,4,5/ 6,7,8
    				$$invalidate(1, winner = player);
    			}
    		}

    		//winning conditions down colums
    		for (let h = 0; h < 3; h++) {
    			// h 0, 1, 2
    			if (grid[h] === player && grid[h + 3] === player && grid[h + 6] === player) {
    				// covers 0,3,6  1,4,7  2,5,8
    				$$invalidate(1, winner = player);
    			}
    		}

    		//diagonal winning conditions
    		if (grid[0] + grid[4] + grid[8] === player + player + player || grid[2] + grid[4] + grid[6] === player + player + player) {
    			// covers 0,3,6  1,4,7  2,5,8
    			$$invalidate(1, winner = player);
    		}

    		console.log($count);
    	}

    	//generates random number for pc player
    	const rand = () => {
    		const number = Math.floor(Math.random() * 9);
    		return !grid[number] ? number : rand();
    	};

    	//called with mousedown on a box
    	const play = choice => {
    		$$invalidate(15, turnCount += 1);
    		$$invalidate(0, grid[choice] = "O", grid); //sets the grid number on the board to 'O'
    		success = true;
    		winA("O"); //check for a win
    	};

    	//called on mouseup
    	const computer = async () => {
    		$$invalidate(16, pcTurnCount += 1);
    		success = false;
    		const delay = new Promise(resolve => setTimeout(() => resolve("completed"), 500));
    		await delay; //.then((message) => {
    		$$invalidate(0, grid[rand()] = "X", grid); //sets X on random board tile
    		winA("X"); //})
    	};

    	const pcCanPLay = () => turnCount === 1 + pcTurnCount && totalCount < 9 && !winner && success;
    	const uCanPlay = i => !winner && turnCount === pcTurnCount && !blocked && !grid[i];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Ttt> was created with unknown prop '${key}'`);
    	});

    	const introstart_handler = () => $$invalidate(2, blocked = true);
    	const introend_handler = () => $$invalidate(2, blocked = false);
    	const mousedown_handler = i => uCanPlay(i) && play(i);
    	const mouseup_handler = () => pcCanPLay() && computer();
    	const click_handler = () => reset();

    	$$self.$capture_state = () => ({
    		fly,
    		fade,
    		scale,
    		elasticOut,
    		quintOut,
    		count,
    		Button: Button_1,
    		Paper,
    		Title,
    		Subtitle,
    		Content,
    		grid,
    		winner,
    		turnCount,
    		pcTurnCount,
    		success,
    		blocked,
    		reset,
    		spin,
    		winA,
    		rand,
    		play,
    		computer,
    		pcCanPLay,
    		uCanPlay,
    		totalCount,
    		$count
    	});

    	$$self.$inject_state = $$props => {
    		if ("grid" in $$props) $$invalidate(0, grid = $$props.grid);
    		if ("winner" in $$props) $$invalidate(1, winner = $$props.winner);
    		if ("turnCount" in $$props) $$invalidate(15, turnCount = $$props.turnCount);
    		if ("pcTurnCount" in $$props) $$invalidate(16, pcTurnCount = $$props.pcTurnCount);
    		if ("success" in $$props) success = $$props.success;
    		if ("blocked" in $$props) $$invalidate(2, blocked = $$props.blocked);
    		if ("totalCount" in $$props) $$invalidate(3, totalCount = $$props.totalCount);
    	};

    	let totalCount;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*turnCount, pcTurnCount*/ 98304) {
    			 $$invalidate(3, totalCount = turnCount + pcTurnCount);
    		}

    		if ($$self.$$.dirty & /*winner, $count*/ 262146) {
    			 winner === "O" && set_store_value(count, $count++, $count);
    		}

    		if ($$self.$$.dirty & /*winner, $count*/ 262146) {
    			 winner === "X" && set_store_value(count, $count--, $count);
    		}
    	};

    	return [
    		grid,
    		winner,
    		blocked,
    		totalCount,
    		reset,
    		spin,
    		play,
    		computer,
    		pcCanPLay,
    		uCanPlay,
    		introstart_handler,
    		introend_handler,
    		mousedown_handler,
    		mouseup_handler,
    		click_handler
    	];
    }

    class Ttt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ttt",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    //tree
    const _tree = {
      "name": "root",
      "filepath": "/",
      "root": true,
      "ownMeta": {},
      "absolutePath": "src/pages",
      "children": [
        {
          "isFile": true,
          "isDir": false,
          "file": "_fallback.svelte",
          "filepath": "/_fallback.svelte",
          "name": "_fallback",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/_fallback.svelte",
          "importPath": "../../../../src/pages/_fallback.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": true,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/_fallback",
          "id": "__fallback",
          "component": () => Fallback
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "_layout.svelte",
          "filepath": "/_layout.svelte",
          "name": "_layout",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/_layout.svelte",
          "importPath": "../../../../src/pages/_layout.svelte",
          "isLayout": true,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/",
          "id": "__layout",
          "component": () => Layout
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "experimental.svelte",
          "filepath": "/experimental.svelte",
          "name": "experimental",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/experimental.svelte",
          "importPath": "../../../../src/pages/experimental.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/experimental",
          "id": "_experimental",
          "component": () => Experimental
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "gitLookup.svelte",
          "filepath": "/gitLookup.svelte",
          "name": "gitLookup",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/gitLookup.svelte",
          "importPath": "../../../../src/pages/gitLookup.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/gitLookup",
          "id": "_gitLookup",
          "component": () => GitLookup
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "hangman.svelte",
          "filepath": "/hangman.svelte",
          "name": "hangman",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/hangman.svelte",
          "importPath": "../../../../src/pages/hangman.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/hangman",
          "id": "_hangman",
          "component": () => Hangman
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/index.svelte",
          "importPath": "../../../../src/pages/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/index",
          "id": "_index",
          "component": () => Pages
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "terminal.svelte",
          "filepath": "/terminal.svelte",
          "name": "terminal",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/terminal.svelte",
          "importPath": "../../../../src/pages/terminal.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/terminal",
          "id": "_terminal",
          "component": () => Terminal
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "ttt.svelte",
          "filepath": "/ttt.svelte",
          "name": "ttt",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/mwilson/projects/unifiedArcade/src/pages/ttt.svelte",
          "importPath": "../../../../src/pages/ttt.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "preload": false,
            "prerender": true,
            "precache-order": false,
            "precache-proximity": true,
            "recursive": true
          },
          "path": "/ttt",
          "id": "_ttt",
          "component": () => Ttt
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "meta": {
        "preload": false,
        "prerender": true,
        "precache-order": false,
        "precache-proximity": true,
        "recursive": true
      },
      "path": "/"
    };


    const {tree, routes: routes$1} = buildClientTree(_tree);

    /* src/App.svelte generated by Svelte v3.29.0 */

    function create_fragment$B(ctx) {
    	let router;
    	let current;
    	router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes: routes$1 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
