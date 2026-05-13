type GraphQLOperationDefinition = {
  kind: string
  operation: string
  name?: {
    value: string
  }
}

type GraphQLDocumentNode = {
  kind: string
  definitions: GraphQLOperationDefinition[]
  loc?: {
    source?: {
      body?: string
    }
  }
}

type GraphQLTypeConfig = {
  name?: string
  fields?: unknown
  values?: unknown
  types?: unknown
  interfaces?: unknown
  ofType?: unknown
  [key: string]: unknown
}

export const Kind = {
  DOCUMENT: 'Document',
  OPERATION_DEFINITION: 'OperationDefinition',
}

class GraphQLNamedType {
  name?: string

  constructor(config: GraphQLTypeConfig = {}) {
    Object.assign(this, config)
    this.name = config.name
  }
}

export class GraphQLScalarType extends GraphQLNamedType {}
export class GraphQLObjectType extends GraphQLNamedType {}
export class GraphQLInterfaceType extends GraphQLNamedType {}
export class GraphQLUnionType extends GraphQLNamedType {}
export class GraphQLEnumType extends GraphQLNamedType {}
export class GraphQLInputObjectType extends GraphQLNamedType {}

export class GraphQLList {
  ofType: unknown

  constructor(ofType: unknown) {
    this.ofType = ofType
  }
}

export class GraphQLNonNull {
  ofType: unknown

  constructor(ofType: unknown) {
    this.ofType = ofType
  }
}

export class GraphQLError extends Error {
  extensions?: unknown
  locations?: unknown
  path?: unknown

  constructor(message: string, options: Record<string, unknown> = {}) {
    super(message)
    this.name = 'GraphQLError'
    Object.assign(this, options)
  }
}

export const isListType = (value: unknown): value is GraphQLList => {
  return value instanceof GraphQLList
}

export const isNonNullType = (value: unknown): value is GraphQLNonNull => {
  return value instanceof GraphQLNonNull
}

export const parse = (source: string): GraphQLDocumentNode => {
  const expression = String(source)
  const match = expression.match(
    /\b(query|mutation|subscription)\s+([_A-Za-z][_0-9A-Za-z]*)?/
  )

  return {
    kind: Kind.DOCUMENT,
    definitions: match
      ? [
          {
            kind: Kind.OPERATION_DEFINITION,
            operation: match[1],
            name: match[2] ? { value: match[2] } : undefined,
          },
        ]
      : [],
    loc: {
      source: {
        body: expression,
      },
    },
  }
}

export const print = (document: unknown): string => {
  if (typeof document === 'string') {
    return document
  }

  const maybeDocument = document as GraphQLDocumentNode | undefined
  return maybeDocument?.loc?.source?.body ?? ''
}
