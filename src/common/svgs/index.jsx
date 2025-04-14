const calc = 16

export const Sun = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" />
    </svg>

export const Moon = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 312 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M144.7 98.7c-21 34.1-33.1 74.3-33.1 117.3c0 98 62.8 181.4 150.4 211.7c-12.4 2.8-25.3 4.3-38.6 4.3C126.6 432 48 353.3 48 256c0-68.9 39.4-128.4 96.8-157.3zm62.1-66C91.1 41.2 0 137.9 0 256C0 379.7 100 480 223.5 480c47.8 0 92-15 128.4-40.6c1.9-1.3 3.7-2.7 5.5-4c4.8-3.6 9.4-7.4 13.9-11.4c2.7-2.4 5.3-4.8 7.9-7.3c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-3.7 .6-7.4 1.2-11.1 1.6c-5 .5-10.1 .9-15.3 1c-1.2 0-2.5 0-3.7 0c-.1 0-.2 0-.3 0c-96.8-.2-175.2-78.9-175.2-176c0-54.8 24.9-103.7 64.1-136c1-.9 2.1-1.7 3.2-2.6c4-3.2 8.2-6.2 12.5-9c3.1-2 6.3-4 9.6-5.8c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-3.6-.3-7.1-.5-10.7-.6c-2.7-.1-5.5-.1-8.2-.1c-3.3 0-6.5 .1-9.8 .2c-2.3 .1-4.6 .2-6.9 .4z" />
    </svg>

export const Helmet = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M256 32c-17.7 0-32 14.3-32 32v2.3 99.6c0 5.6-4.5 10.1-10.1 10.1c-3.6 0-7-1.9-8.8-5.1L157.1 87C83 123.5 32 199.8 32 288v64H544l0-66.4c-.9-87.2-51.7-162.4-125.1-198.6l-48 83.9c-1.8 3.2-5.2 5.1-8.8 5.1c-5.6 0-10.1-4.5-10.1-10.1V66.3 64c0-17.7-14.3-32-32-32H256zM16.6 384C7.4 384 0 391.4 0 400.6c0 4.7 2 9.2 5.8 11.9C27.5 428.4 111.8 480 288 480s260.5-51.6 282.2-67.5c3.8-2.8 5.8-7.2 5.8-11.9c0-9.2-7.4-16.6-16.6-16.6H16.6z" />
    </svg >

/* export const Mask = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path d="M320 64c-27.2 0-53.8 8-76.4 23.1l-37.1 24.8c-15.8 10.5-34.3 16.1-53.3 16.1H144 128 56c-30.9 0-56 25.1-56 56v85c0 55.1 37.5 103.1 90.9 116.4l108 27C233.8 435 275.4 448 320 448s86.2-13 121.1-35.5l108-27C602.5 372.1 640 324.1 640 269V184c0-30.9-25.1-56-56-56H512 496h-9.2c-19 0-37.5-5.6-53.3-16.1L396.4 87.1C373.8 72 347.2 64 320 64zM132.3 346.3l-29.8-7.4C70.5 330.9 48 302.1 48 269V184c0-4.4 3.6-8 8-8H96v48c0 45.1 13.4 87.2 36.3 122.3zm405.1-7.4l-29.8 7.4c23-35.2 36.3-77.2 36.3-122.3V176h40c4.4 0 8 3.6 8 8v85c0 33-22.5 61.8-54.5 69.9zM192 208c0-8.8 7.2-16 16-16H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H208c-8.8 0-16-7.2-16-16zm16 48H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H208c-8.8 0-16-7.2-16-16s7.2-16 16-16zm16 80c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16s-7.2 16-16 16H240c-8.8 0-16-7.2-16-16z" />
    </svg > */

export const Gloves = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M352 384H64L5.4 178.9C1.8 166.4 0 153.4 0 140.3C0 62.8 62.8 0 140.3 0h3.4c66 0 123.5 44.9 139.5 108.9l31.4 125.8 17.6-20.1C344.8 200.2 362.9 192 382 192h2.8c34.9 0 63.3 28.3 63.3 63.3c0 15.9-6 31.2-16.8 42.9L352 384zM32 448c0-17.7 14.3-32 32-32H352c17.7 0 32 14.3 32 32v32c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V448z" />
    </svg >

export const Key = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z" />
    </svg>

export const Vest = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M151.2 69.7l55.9 167.7-11 33.1c-2.7 8.2-4.1 16.7-4.1 25.3V464c0 14.5 3.9 28.2 10.7 39.9C195 509 185.9 512 176 512H48c-26.5 0-48-21.5-48-48V270.5c0-9.5 2.8-18.7 8.1-26.6l47.9-71.8c5.3-7.9 8.1-17.1 8.1-26.6V128 54.3 48C64 21.5 85.5 0 112 0h4.5c.2 0 .4 0 .6 0c.4 0 .8 0 1.2 0c18.8 0 34.1 9.7 44.1 18.8C171.6 27.2 190.8 40 224 40s52.4-12.8 61.7-21.2C295.7 9.7 311 0 329.7 0c.4 0 .8 0 1.2 0c.2 0 .4 0 .6 0H336c26.5 0 48 21.5 48 48v6.3V128v17.5c0 9.5 2.8 18.7 8.1 26.6l47.9 71.8c5.3 7.9 8.1 17.1 8.1 26.6V464c0 26.5-21.5 48-48 48H272c-26.5 0-48-21.5-48-48V295.8c0-5.2 .8-10.3 2.5-15.2L296.8 69.7C279.4 79.7 255.4 88 224 88s-55.4-8.3-72.8-18.3zM96 456a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM63.5 255.5c-4.7 4.7-4.7 12.3 0 17L79 288 63.5 303.5c-4.7 4.7-4.7 12.3 0 17s12.3 4.7 17 0L96 305l15.5 15.5c4.7 4.7 12.3 4.7 17 0s4.7-12.3 0-17L113 288l15.5-15.5c4.7-4.7 4.7-12.3 0-17s-12.3-4.7-17 0L96 271 80.5 255.5c-4.7-4.7-12.3-4.7-17 0zM304 280v8 32c0 8.8 7.2 16 16 16h32 8c13.3 0 24-10.7 24-24s-10.7-24-24-24h-8v-8c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
    </svg >

/* export const Thermometer = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M96 382.1V293.3c0-14.9 5.9-29.1 16.4-39.6l27.3-27.3 57 57c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-57-57 41.4-41.4 57 57c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-57-57 41.4-41.4 57 57c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-57-57 45.5-45.5C355.2 10.9 381.4 0 408.8 0C465.8 0 512 46.2 512 103.2c0 27.4-10.9 53.6-30.2 73L258.3 399.6c-10.5 10.5-24.7 16.4-39.6 16.4H129.9L41 505c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l89-89z" />
    </svg> */

/* export const Gauge = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM256 416c35.3 0 64-28.7 64-64c0-17.4-6.9-33.1-18.1-44.6L366 161.7c5.3-12.1-.2-26.3-12.3-31.6s-26.3 .2-31.6 12.3L257.9 288c-.6 0-1.3 0-1.9 0c-35.3 0-64 28.7-64 64s28.7 64 64 64zM176 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM96 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm352-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
    </svg> */

export const File = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z" />
    </svg>

/* export const Tag = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path d="M0 80L0 229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7L48 32C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
    </svg> */

export const Spray = ({
    size = 16,
    color = '#fff'
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        {/* !Font Awesome Free 6.7.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. */}
        <path d="M128 0l64 0c17.7 0 32 14.3 32 32l0 96L96 128l0-96c0-17.7 14.3-32 32-32zM0 256c0-53 43-96 96-96l128 0c53 0 96 43 96 96l0 208c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 256zm240 80A80 80 0 1 0 80 336a80 80 0 1 0 160 0zM256 64a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM384 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm64 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM448 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM384 128a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
    </svg>

export const Bottle = ({
    size = 16,
    color = '#fff',
}) => <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
        <path d="M120 0l80 0c13.3 0 24 10.7 24 24l0 40L96 64l0-40c0-13.3 10.7-24 24-24zM32 167.5c0-19.5 10-37.6 26.6-47.9l15.8-9.9C88.7 100.7 105.2 96 122.1 96l75.8 0c16.9 0 33.4 4.7 47.7 13.7l15.8 9.9C278 129.9 288 148 288 167.5c0 17-7.5 32.3-19.4 42.6C280.6 221.7 288 238 288 256c0 19.1-8.4 36.3-21.7 48c13.3 11.7 21.7 28.9 21.7 48s-8.4 36.3-21.7 48c13.3 11.7 21.7 28.9 21.7 48c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64c0-19.1 8.4-36.3 21.7-48C40.4 388.3 32 371.1 32 352s8.4-36.3 21.7-48C40.4 292.3 32 275.1 32 256c0-18 7.4-34.3 19.4-45.9C39.5 199.7 32 184.5 32 167.5zM96 240c0 8.8 7.2 16 16 16l96 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-96 0c-8.8 0-16 7.2-16 16zm16 112c-8.8 0-16 7.2-16 16s7.2 16 16 16l96 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-96 0z" />
    </svg>

export const Glass = ({ size = 16, color = '#fff', }) =>
    <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        {/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}
        <path d="M118.6 80c-11.5 0-21.4 7.9-24 19.1L57 260.3c20.5-6.2 48.3-12.3 78.7-12.3c32.3 0 61.8 6.9 82.8 13.5c10.6 3.3 19.3 6.7 25.4 9.2c3.1 1.3 5.5 2.4 7.3 3.2c.9 .4 1.6 .7 2.1 1l.6 .3 .2 .1c0 0 .1 0 .1 0c0 0 0 0 0 0s0 0 0 0L247.9 288s0 0 0 0l6.3-12.7c5.8 2.9 10.4 7.3 13.5 12.7l40.6 0c3.1-5.3 7.7-9.8 13.5-12.7l6.3 12.7s0 0 0 0c-6.3-12.7-6.3-12.7-6.3-12.7s0 0 0 0s0 0 0 0c0 0 .1 0 .1 0l.2-.1 .6-.3c.5-.2 1.2-.6 2.1-1c1.8-.8 4.2-1.9 7.3-3.2c6.1-2.6 14.8-5.9 25.4-9.2c21-6.6 50.4-13.5 82.8-13.5c30.4 0 58.2 6.1 78.7 12.3L481.4 99.1c-2.6-11.2-12.6-19.1-24-19.1c-3.1 0-6.2 .6-9.2 1.8L416.9 94.3c-12.3 4.9-26.3-1.1-31.2-13.4s1.1-26.3 13.4-31.2l31.3-12.5c8.6-3.4 17.7-5.2 27-5.2c33.8 0 63.1 23.3 70.8 56.2l43.9 188c1.7 7.3 2.9 14.7 3.5 22.1c.3 1.9 .5 3.8 .5 5.7l0 6.7 0 41.3 0 16c0 61.9-50.1 112-112 112l-44.3 0c-59.4 0-108.5-46.4-111.8-105.8L306.6 352l-37.2 0-1.2 22.2C264.9 433.6 215.8 480 156.3 480L112 480C50.1 480 0 429.9 0 368l0-16 0-41.3L0 304c0-1.9 .2-3.8 .5-5.7c.6-7.4 1.8-14.8 3.5-22.1l43.9-188C55.5 55.3 84.8 32 118.6 32c9.2 0 18.4 1.8 27 5.2l31.3 12.5c12.3 4.9 18.3 18.9 13.4 31.2s-18.9 18.3-31.2 13.4L127.8 81.8c-2.9-1.2-6-1.8-9.2-1.8zM64 325.4L64 368c0 26.5 21.5 48 48 48l44.3 0c25.5 0 46.5-19.9 47.9-45.3l2.5-45.6c-2.3-.8-4.9-1.7-7.5-2.5c-17.2-5.4-39.9-10.5-63.6-10.5c-23.7 0-46.2 5.1-63.2 10.5c-3.1 1-5.9 1.9-8.5 2.9zM512 368l0-42.6c-2.6-.9-5.5-1.9-8.5-2.9c-17-5.4-39.5-10.5-63.2-10.5c-23.7 0-46.4 5.1-63.6 10.5c-2.7 .8-5.2 1.7-7.5 2.5l2.5 45.6c1.4 25.4 22.5 45.3 47.9 45.3l44.3 0c26.5 0 48-21.5 48-48z" />
    </svg>

export const Lock = ({ size = 16, color = '#fff', }) =>
    <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        {/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}
        <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" />
    </svg>

export const Respirator = ({ size = 16, color = '#fff', }) =>
    <svg style={{ marginBottom: -(size / calc), height: size, width: size, fill: color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        {/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}
        <path d="M159.1 176C139.4 219.2 128 264.7 128 300.8c0 15.9 2.2 31.4 6.3 46l-31.8-7.9C70.5 330.9 48 302.1 48 269l0-85c0-4.4 3.6-8 8-8l103.1 0zm26-48L56 128c-30.9 0-56 25.1-56 56l0 85c0 55.1 37.5 103.1 90.9 116.4l71.3 17.8c22.7 30.5 55.4 54.1 93.8 66.6l0-76.6c-19.7-16.4-32-40.3-32-66.9c0-49.5 43-134.4 96-134.4c52.5 0 96 84.9 96 134.4c0 26.7-12.4 50.4-32 66.8l0 76.6c38-12.6 70.6-36 93.5-66.4l71.6-17.9C602.5 372.1 640 324.1 640 269l0-85c0-30.9-25.1-56-56-56l-129.5 0C419.7 73.8 372.1 32 320 32c-52.6 0-100.2 41.8-134.9 96zm295.6 48L584 176c4.4 0 8 3.6 8 8l0 85c0 33-22.5 61.8-54.5 69.9l-31.8 8c4.2-14.7 6.4-30.1 6.4-46.1c0-36.1-11.6-81.6-31.3-124.8zM288 320l0 192 64 0 0-192c0-17.7-14.3-32-32-32s-32 14.3-32 32z" />
    </svg>

export const IconMap = (token, key, { size = 14, color = null }) => {

    const kv = {
        Helmet: <Helmet color={color ? color : token.colorText} size={size} />,
        // Mask: <Mask color={color ? color : token.colorText} size={size} />,
        Gloves: <Gloves color={color ? color : token.colorText} size={size} />,
        Key: <Key color={color ? color : token.colorText} size={size} />,
        Vest: <Vest color={color ? color : token.colorText} size={size} />,
        // Thermometer: <Thermometer color={color ? color : token.colorText} size={size} />,
        // Gauge: <Gauge color={color ? color : token.colorText} size={size} />,
        File: <File color={color ? color : token.colorText} size={size} />,
        // Tag: <Tag color={color ? color : token.colorText} size={size} />,
        Spray: <Spray color={color ? color : token.colorText} size={size} />,
        Bottle: <Bottle color={color ? color : token.colorText} size={size} />,
        Glass: <Glass color={color ? color : token.colorText} size={size} />,
        Lock: <Lock color={color ? color : token.colorText} size={size} />,
        Respirator: <Respirator color={color ? color : token.colorText} size={size} />,
    }

    return kv[key] ?? kv['File']

}