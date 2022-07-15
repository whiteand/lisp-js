# Algebraic Effects

## Concepts

### Resumable Execution
- It should have all locally  available constants to be stored somewhere
- It should have it's parent
- Parent can provide handling of event
- Parent can omit providing of handling of event

```
Parent                Performing Effect
__________            _________________
          Child       Effect           Child resumes with the result
          ____________                 _____

```
## Examples

```javascript
function handleFile(fileName: string) {
    const fileContent = perform readFile(fileName + '.js')
    const lines = perform calculateLines(fileContent)
    perform log(`${fileName}: ${lines.lines}`)
    return lines.length
}

function main() {
    try {
        handleFile('index')
    } handle (effect, resolve) {
        if (effect.type == 'readFile') {
            fs.readFile(effect.fileName, (error,data) => {
                if (error) resolve({ error })
                resolve({ data })
            })
        }
        if (effect.type === 'calculateLines') {
            resolve(effect.content.split('\n'))
        }
        if (effect.type === 'log') {
            console.log(effect.string)
            resolve()
        }
        resolve(perform effect)
    } catch (error) {

    }
}
```

Compiled version:
```javascript
const handleFile =(perform) => ({
    ctx: {},
    nextResumeIndex: 0,
    call(fileName) {
        this.nextResumeIndex = 0
        this.ctx.fileName = fileName
        const fp = this.ctx.fileName + '.js'
        perform({ type: 'readFile', fileName: fp }, this)
    },
    resumes: [
        (ctx, effect, fileContent, ) => {
            if (fileContent.error) {
                throw new Error(`Cannot perform ${effect.type}: ${fileContent.error.message}`)
            }
            ctx.fileContent = fileContent.data

            perform({ 
                type: 'calculateLines',
                data: ctx.fileContent
            }, this)
            return [false]
        },
        (ctx, effect, linesCount) => {
            if (linesCount.error) {
                throw new Error(`Cannot perform ${effect.type}: ${linesCount.error.message}`)
            }
            ctx.linesCount = linesCount.data

            const s = `${fileName}: ${lines.lines}`
            perform({
                type: 'log',
                data: s,
            }, this)
            return [false]
        }, 
        (ctx, effect, value) => {
            return [true, ctx.linesCount]
        }
    ],
    resume(effect, value) {
        const resumeFn = this.resumes(this.nextResumeIndex++)
        const done = resumeFn(this.ctx, effect, value)
    }
})

function main() {
    const perform = (effect, func) => {
        const resume = 9
    }
}
```
